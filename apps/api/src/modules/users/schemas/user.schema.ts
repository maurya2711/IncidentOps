import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserRole } from '@incidentops/shared';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class UserSession {
  @Prop({ required: true })
  sessionId!: string;

  @Prop({ required: true })
  refreshTokenHash!: string;

  @Prop()
  deviceName?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

const UserSessionSchema = SchemaFactory.createForClass(UserSession);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.MEMBER })
  role!: UserRole;

  @Prop()
  avatar?: string;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ default: 'UTC' })
  timezone!: string;

  @Prop()
  bio?: string;

  @Prop({ select: false })
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  // --- Invite flow ---
  @Prop({ select: false })
  inviteToken?: string;

  @Prop()
  inviteTokenExpires?: Date;

  @Prop({ default: false })
  isInvitePending!: boolean;

  @Prop({ type: String })
  invitedBy?: string; // userId of creator

  @Prop({ type: [UserSessionSchema], default: [] })
  sessions!: UserSession[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });
UserSchema.index({ inviteToken: 1 });
