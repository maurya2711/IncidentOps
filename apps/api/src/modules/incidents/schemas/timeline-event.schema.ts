import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { TimelineEventType } from '@incidentops/shared';

export type TimelineEventDocument = TimelineEvent & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class TimelineEvent {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Incident', required: true })
  incidentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: TimelineEventType, required: true })
  type: TimelineEventType;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  actor: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);
