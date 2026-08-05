import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { NotificationType } from '@incidentops/shared';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  link: string;

  @Prop({ default: false, index: true })
  read: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, refPath: 'resourceModel' })
  resourceId: MongooseSchema.Types.ObjectId;

  @Prop()
  resourceModel: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
