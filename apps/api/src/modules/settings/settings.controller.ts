import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';

class UpdateProfileDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() bio?: string;
  @IsString() @IsOptional() timezone?: string;
}

class ChangePasswordDto {
  @IsString() currentPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.settingsService.getProfile(req.user.sub);
  }

  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.settingsService.updateProfile(req.user.sub, dto);
  }

  @Post('change-password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.settingsService.changePassword(req.user.sub, dto);
  }

  @Get('sessions')
  getSessions(@Req() req: any) {
    return this.settingsService.getSessions(req.user.sub);
  }

  @Post('sessions/:sessionId/revoke')
  revokeSession(@Req() req: any, @Param('sessionId') sessionId: string) {
    return this.settingsService.revokeSession(req.user.sub, sessionId);
  }

  @Post('sessions/revoke-all')
  revokeAllSessions(@Req() req: any) {
    return this.settingsService.revokeAllSessions(req.user.sub, req.user.sessionId);
  }
}
