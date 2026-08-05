import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Model } from 'mongoose';

import { BCRYPT_ROUNDS, UserRole } from '@incidentops/shared';

import { MailService } from '../../shared/mail/mail.service';
import { User, UserDocument } from '../users/schemas/user.schema';

// Who can create / manage which roles
const ROLE_PERMISSIONS: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MEMBER,
    UserRole.VIEWER,
  ],
  [UserRole.ADMIN]: [UserRole.MANAGER, UserRole.MEMBER, UserRole.VIEWER],
  [UserRole.MANAGER]: [UserRole.MEMBER, UserRole.VIEWER],
  [UserRole.MEMBER]: [],
  [UserRole.VIEWER]: [],
};

export interface CreateUserByAdminDto {
  name: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
    return ROLE_PERMISSIONS[actorRole]?.includes(targetRole) ?? false;
  }

  private toSafe(user: UserDocument) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      isInvitePending: user.isInvitePending,
      invitedBy: user.invitedBy,
      lastLoginAt: user.lastLoginAt,
      createdAt: (user as any).createdAt,
    };
  }

  // ─── User Listing ─────────────────────────────────────────────────────────

  async findAll(actorRole: UserRole, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Determine which roles this actor can see
    const visibleRoles =
      actorRole === UserRole.SUPER_ADMIN || actorRole === UserRole.ADMIN
        ? Object.values(UserRole)
        : ROLE_PERMISSIONS[actorRole];

    const filter = { role: { $in: visibleRoles } };
    const [users, total] = await Promise.all([
      this.userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── Invite / Create ─────────────────────────────────────────────────────

  async inviteUser(
    actorId: string,
    actorName: string,
    actorRole: UserRole,
    dto: CreateUserByAdminDto,
  ) {
    if (!this.canManageRole(actorRole, dto.role)) {
      throw new ForbiddenException(
        `Your role (${actorRole}) cannot create users with role (${dto.role})`,
      );
    }

    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    // Placeholder password — user must set their own via the invite link
    const placeholderPassword = await bcrypt.hash(
      crypto.randomBytes(32).toString('hex'),
      BCRYPT_ROUNDS,
    );

    const user = new this.userModel({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: placeholderPassword,
      role: dto.role,
      isVerified: false,
      isActive: true,
      isInvitePending: true,
      inviteToken,
      inviteTokenExpires: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
      invitedBy: actorId,
    });

    await user.save();

    // Fire-and-forget invitation email so HTTP response returns instantly without waiting for SMTP
    this.mailService
      .sendInvitationEmail(dto.email, dto.name, inviteToken, actorName, dto.role)
      .catch(() => {});

    return {
      message: `Invitation sent to ${dto.email}`,
      user: this.toSafe(user),
      inviteToken,
    };
  }

  // ─── Resend Invite ───────────────────────────────────────────────────────

  async resendInvite(actorRole: UserRole, userId: string) {
    const user = await this.userModel.findById(userId).select('+inviteToken');
    if (!user) throw new NotFoundException('User not found');

    if (!this.canManageRole(actorRole, user.role)) {
      throw new ForbiddenException('You do not have permission to manage this user');
    }

    if (user.isVerified) {
      throw new BadRequestException('User has already accepted their invitation');
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    user.inviteToken = inviteToken;
    user.inviteTokenExpires = new Date(Date.now() + 72 * 60 * 60 * 1000);
    user.isInvitePending = true;
    await user.save();

    this.mailService
      .sendInvitationEmail(user.email, user.name, inviteToken, 'Admin', user.role)
      .catch(() => {});

    return { message: `Invitation resent to ${user.email}`, inviteToken };
  }

  // ─── Update (role / active) ───────────────────────────────────────────────

  async updateUser(
    actorId: string,
    actorRole: UserRole,
    userId: string,
    dto: { role?: UserRole; isActive?: boolean },
  ) {
    if (actorId === userId) {
      throw new BadRequestException('You cannot modify your own account here');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!this.canManageRole(actorRole, user.role)) {
      throw new ForbiddenException('You do not have permission to manage this user');
    }

    if (dto.role !== undefined) {
      if (!this.canManageRole(actorRole, dto.role)) {
        throw new ForbiddenException(`You cannot assign role (${dto.role})`);
      }
      user.role = dto.role;
    }

    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
      if (!dto.isActive) {
        // Revoke all sessions on deactivation
        user.sessions = [];
      }
    }

    await user.save();
    return this.toSafe(user);
  }

  // ─── Delete (hard) ───────────────────────────────────────────────────────

  async deleteUser(actorId: string, actorRole: UserRole, userId: string) {
    if (actorId === userId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    if (actorRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can permanently delete users');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot delete another SUPER_ADMIN');
    }

    await this.userModel.deleteOne({ _id: userId });
    return { message: 'User deleted permanently' };
  }
}
