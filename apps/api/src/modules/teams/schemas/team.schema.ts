import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { TeamRole } from '@incidentops/shared';

export type TeamDocument = Team & Document;

@Schema({ _id: false })
export class TeamMember {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: TeamRole, default: TeamRole.MEMBER })
  role: TeamRole;

  @Prop({ default: Date.now })
  joinedAt: Date;

  @Prop({ default: true })
  isAvailable: boolean;
}
export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [TeamMemberSchema], default: [] })
  members: TeamMember[];

  @Prop()
  slackChannel: string;

  @Prop()
  escalationPolicy: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
