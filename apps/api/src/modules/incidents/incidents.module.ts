import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Incident, IncidentSchema } from './schemas/incident.schema';
import { TimelineEvent, TimelineEventSchema } from './schemas/timeline-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Incident.name, schema: IncidentSchema },
      { name: TimelineEvent.name, schema: TimelineEventSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
})
export class IncidentsModule {}
