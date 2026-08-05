import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Incident', required: true })
  incidentId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isEdited: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
