import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio,
      timezone: user.timezone,
      isVerified: user.isVerified,
      createdAt: (user as any).createdAt,
    };
  }

  async updateProfile(userId: string, dto: { name?: string; bio?: string; timezone?: string }) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: dto }, { new: true })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return this.getProfile(userId);
  }

  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.userModel.findById(userId).select('+password').exec();
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    if (dto.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    user.password = hashed;
    await user.save();
    return { message: 'Password changed successfully' };
  }

  async getSessions(userId: string) {
    const user = await this.userModel.findById(userId).select('+sessions').exec();
    if (!user) throw new NotFoundException('User not found');
    return (user as any).sessions ?? [];
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $pull: { sessions: { id: sessionId } },
      })
      .exec();
    return { message: 'Session revoked' };
  }

  async revokeAllSessions(userId: string, currentSessionId: string) {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $pull: { sessions: { id: { $ne: currentSessionId } } },
      })
      .exec();
    return { message: 'All other sessions revoked' };
  }
}
