import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { ServiceStatus } from '@incidentops/shared';

export type ServiceDocument = Service & Document;

@Schema({ _id: false })
export class ServiceDependency {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
  service: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ServiceStatus, default: ServiceStatus.OPERATIONAL })
  status: ServiceStatus;
}
export const ServiceDependencySchema = SchemaFactory.createForClass(ServiceDependency);

@Schema({ _id: false })
export class ServiceMetricPoint {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ default: 0 })
  latency: number;

  @Prop({ default: 0 })
  errorRate: number;

  @Prop({ default: 0 })
  requestCount: number;
}
export const ServiceMetricPointSchema = SchemaFactory.createForClass(ServiceMetricPoint);

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: ServiceStatus, default: ServiceStatus.OPERATIONAL })
  status: ServiceStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  team: MongooseSchema.Types.ObjectId;

  @Prop({ default: 100 })
  uptime: number;

  @Prop({ default: 0 })
  latency: number;

  @Prop({ default: 0 })
  errorRate: number;

  @Prop({ type: [ServiceDependencySchema], default: [] })
  dependencies: ServiceDependency[];

  @Prop({ type: [ServiceMetricPointSchema], default: [] })
  metrics: ServiceMetricPoint[];

  @Prop({ unique: true })
  statusBadgeToken: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Index for faster status queries
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ statusBadgeToken: 1 }, { unique: true });
