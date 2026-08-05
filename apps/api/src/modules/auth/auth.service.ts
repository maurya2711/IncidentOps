import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { BCRYPT_ROUNDS, TIME } from '@incidentops/shared';

import { MailService } from '../../shared/mail/mail.service';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponse, AuthTokens, JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Self-registration is DISABLED. Accounts are created exclusively by
   * SUPER_ADMIN/ADMIN via the Admin module. This method is kept for seeding only.
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await this.usersService.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + TIME.EMAIL_VERIFICATION_TTL_MS),
    });

    await this.mailService.sendVerificationEmail(dto.email, dto.name, verificationToken);

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async acceptInvite(dto: { token: string; password: string }): Promise<{ message: string }> {
    const user = await this.usersService.findByInviteToken(dto.token);

    if (!user) {
      throw new BadRequestException(
        'Invalid or expired invitation link. Please ask your admin to resend the invite.',
      );
    }

    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    user.password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    user.isVerified = true;
    user.isInvitePending = false;
    user.inviteToken = undefined;
    user.inviteTokenExpires = undefined;
    await user.save();

    return { message: 'Account activated successfully. You can now log in.' };
  }

  async login(
    dto: LoginDto,
    meta: { ipAddress?: string; userAgent?: string },
  ): Promise<{ auth: AuthResponse; refreshToken: string; refreshExpiry: string }> {
    const user = await this.usersService.findByEmail(dto.email, true);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const refreshExpiry = dto.rememberMe
      ? this.configService.get<string>('jwt.refreshRememberExpiry')!
      : this.configService.get<string>('jwt.refreshExpiry')!;

    const tokens = await this.generateTokens(user, refreshExpiry, meta);

    user.lastLoginAt = new Date();
    await user.save();

    return {
      auth: {
        accessToken: tokens.accessToken,
        user: this.usersService.toPublic(user),
      },
      refreshToken: tokens.refreshToken,
      refreshExpiry,
    };
  }

  async refresh(
    payload: JwtPayload & { refreshToken: string },
  ): Promise<{ accessToken: string; refreshToken?: string; refreshExpiry?: string }> {
    const user = await this.usersService.findByIdWithSecrets(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = user.sessions.find((s) => s.sessionId === payload.sessionId);
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const tokenHash = this.hashToken(payload.refreshToken);
    if (session.refreshTokenHash !== tokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: payload.sessionId,
    });

    return { accessToken };
  }

  async logout(userId: string, sessionId: string): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    if (user) {
      user.sessions = user.sessions.filter((s) => s.sessionId !== sessionId);
      await user.save();
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.usersService.update(userId, { sessions: [] });
    return { message: 'All sessions revoked' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + TIME.PASSWORD_RESET_TTL_MS);
      await user.save();

      await this.mailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    }

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(dto.token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.sessions = [];
    await user.save();

    return { message: 'Password reset successful. Please log in with your new password.' };
  }

  async getMe(userId: string) {
    return this.usersService.getProfile(userId);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + TIME.EMAIL_VERIFICATION_TTL_MS);
    await user.save();

    await this.mailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  private async generateTokens(
    user: UserDocument,
    refreshExpiry: string,
    meta: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    const sessionId = crypto.randomUUID();

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload, refreshExpiry),
    ]);

    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = this.parseExpiry(refreshExpiry);

    user.sessions.push({
      sessionId,
      refreshTokenHash,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      deviceName: this.parseDeviceName(meta.userAgent),
      expiresAt,
      createdAt: new Date(),
    });

    await user.save();

    return { accessToken, refreshToken };
  }

  private signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiry'),
    });
  }

  private signRefreshToken(payload: JwtPayload, expiresIn: string): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn,
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(expiry: string): Date {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * (multipliers[unit] ?? multipliers.d!));
  }

  private parseDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Unknown device';
    if (userAgent.includes('Mobile')) return 'Mobile device';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown device';
  }
}
