import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { UserRole } from '@incidentops/shared';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminService, CreateUserByAdminDto } from './admin.service';

class InviteUserDto implements CreateUserByAdminDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsEnum(UserRole) role: UserRole;
}

class UpdateUserDto {
  @IsEnum(UserRole) @IsOptional() role?: UserRole;
  @IsBoolean() @IsOptional() isActive?: boolean;
}

@ApiTags('Admin — User Management')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List users (filtered by actor role)' })
  findAll(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.findAll(req.user.role, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Invite a new user' })
  invite(@Req() req: any, @Body() dto: InviteUserDto) {
    return this.adminService.inviteUser(req.user.sub, req.user.name ?? 'Admin', req.user.role, dto);
  }

  @Post(':id/resend-invite')
  @ApiOperation({ summary: 'Resend invitation email' })
  resendInvite(@Req() req: any, @Param('id') id: string) {
    return this.adminService.resendInvite(req.user.role, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user role or active status' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(req.user.sub, req.user.role, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete user (SUPER_ADMIN only)' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.adminService.deleteUser(req.user.sub, req.user.role, id);
  }
}
