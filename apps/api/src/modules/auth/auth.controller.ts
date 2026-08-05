import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';

import { RATE_LIMIT } from '@incidentops/shared';

import { Public } from '../../common/decorators';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const REFRESH_COOKIE = 'refreshToken';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: RATE_LIMIT.AUTH_WINDOW_MS, limit: RATE_LIMIT.AUTH_MAX_REQUESTS } })
  @ApiOperation({ summary: 'Register — SUPER_ADMIN seeding only (use /admin/users for invites)' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('accept-invite')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: RATE_LIMIT.AUTH_WINDOW_MS, limit: RATE_LIMIT.AUTH_MAX_REQUESTS } })
  @ApiOperation({ summary: 'Accept invitation and set password' })
  async acceptInvite(@Body() dto: { token: string; password: string }) {
    const result = await this.authService.acceptInvite(dto);
    return { data: result };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: RATE_LIMIT.AUTH_WINDOW_MS, limit: RATE_LIMIT.AUTH_MAX_REQUESTS } })
  @ApiOperation({ summary: 'Verify email with token' })
  async verifyEmail(@Body() dto: { token: string }) {
    const result = await this.authService.verifyEmail(dto.token);
    return { data: result };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: RATE_LIMIT.AUTH_WINDOW_MS, limit: RATE_LIMIT.AUTH_MAX_REQUESTS } })
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerification(@Body() dto: { email: string }) {
    const result = await this.authService.resendVerification(dto.email);
    return { data: result };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: RATE_LIMIT.AUTH_WINDOW_MS, limit: RATE_LIMIT.AUTH_MAX_REQUESTS } })
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    this.setRefreshCookie(res, result.refreshToken, result.refreshExpiry);

    return result.auth;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @GetUser() user: JwtPayload & { refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(user);

    if (result.refreshToken && result.refreshExpiry) {
      this.setRefreshCookie(res, result.refreshToken, result.refreshExpiry);
    }

    return { accessToken: result.accessToken };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@GetUser() user: JwtPayload | undefined, @Res({ passthrough: true }) res: Response) {
    if (user && user.sub) {
      await this.authService.logout(user.sub, user.sessionId);
    }
    this.clearRefreshCookie(res);
    return { message: 'Logged out successfully' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: RATE_LIMIT.AUTH_WINDOW_MS, limit: RATE_LIMIT.AUTH_MAX_REQUESTS } })
  @ApiOperation({ summary: 'Request password reset email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: RATE_LIMIT.AUTH_WINDOW_MS, limit: RATE_LIMIT.AUTH_MAX_REQUESTS } })
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@GetUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }

  private setRefreshCookie(res: Response, token: string, expiry: string) {
    const maxAge = this.expiryToMs(expiry);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge,
      path: '/',
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
  }

  private expiryToMs(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (multipliers[unit] ?? multipliers.d!);
  }
}
