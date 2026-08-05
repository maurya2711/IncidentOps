import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { IncidentSeverity, IncidentStatus } from '@incidentops/shared';

export type IncidentDocument = Incident & Document;

@Schema({ timestamps: true })
export class Attachment {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  url: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  uploadedBy: MongooseSchema.Types.ObjectId;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

@Schema({ timestamps: true })
export class Incident {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: IncidentSeverity, default: IncidentSeverity.MEDIUM })
  severity: IncidentSeverity;

  @Prop({ type: String, enum: IncidentStatus, default: IncidentStatus.OPEN })
  status: IncidentStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignee: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service' })
  service: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  team: MongooseSchema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [AttachmentSchema], default: [] })
  attachments: Attachment[];

  @Prop()
  resolvedAt: Date;

  @Prop()
  acknowledgedAt: Date;

  @Prop({ unique: true })
  incidentNumber: number;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);

// Auto-increment incidentNumber
IncidentSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastIncident = (await this.model('Incident').findOne(
      {},
      {},
      { sort: { incidentNumber: -1 } },
    )) as any;
    this.incidentNumber =
      lastIncident && lastIncident.incidentNumber ? lastIncident.incidentNumber + 1 : 1000;
  }
  next();
});
