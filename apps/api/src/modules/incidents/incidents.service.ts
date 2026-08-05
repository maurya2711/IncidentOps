import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { IncidentStatus, PaginatedResponse, TimelineEventType } from '@incidentops/shared';

import { AddCommentDto } from './dto/add-comment.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentQueryDto } from './dto/incident-query.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Incident, IncidentDocument } from './schemas/incident.schema';
import { TimelineEvent, TimelineEventDocument } from './schemas/timeline-event.schema';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident.name) private incidentModel: Model<IncidentDocument>,
    @InjectModel(TimelineEvent.name) private timelineEventModel: Model<TimelineEventDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, userId: string): Promise<Incident> {
    const createdIncident = new this.incidentModel(createIncidentDto);
    const incident = await createdIncident.save();

    await this.createTimelineEvent(
      incident._id.toString(),
      TimelineEventType.CREATED,
      'Incident created',
      userId,
    );

    return incident;
  }

  async findAll(query: IncidentQueryDto): Promise<PaginatedResponse<Incident>> {
    const { page = 1, limit = 10, severity, status, assignee, service, search } = query;
    const filter: any = {};

    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (assignee) filter.assignee = new Types.ObjectId(assignee);
    if (service) filter.service = new Types.ObjectId(service);
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.incidentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignee', 'name email avatar')
        .populate('service', 'name status')
        .exec(),
      this.incidentModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Incident> {
    const incident = await this.incidentModel
      .findById(id)
      .populate('assignee', 'name email avatar')
      .populate('service', 'name status')
      .exec();

    if (!incident) {
      throw new NotFoundException(`Incident #${id} not found`);
    }
    return incident;
  }

  async update(
    id: string,
    updateIncidentDto: UpdateIncidentDto,
    userId: string,
  ): Promise<Incident> {
    const existingIncident = await this.incidentModel.findById(id).exec();
    if (!existingIncident) {
      throw new NotFoundException(`Incident #${id} not found`);
    }

    // Check for changes that trigger timeline events
    if (updateIncidentDto.status && updateIncidentDto.status !== existingIncident.status) {
      await this.createTimelineEvent(
        id,
        TimelineEventType.STATUS_CHANGED,
        `Status changed to ${updateIncidentDto.status}`,
        userId,
        { oldStatus: existingIncident.status, newStatus: updateIncidentDto.status },
      );
      if (updateIncidentDto.status === IncidentStatus.RESOLVED) {
        updateIncidentDto.resolvedAt = new Date();
      }
      if (
        updateIncidentDto.status === IncidentStatus.ACKNOWLEDGED &&
        !existingIncident.acknowledgedAt
      ) {
        updateIncidentDto.acknowledgedAt = new Date();
      }
    }

    if (updateIncidentDto.severity && updateIncidentDto.severity !== existingIncident.severity) {
      await this.createTimelineEvent(
        id,
        TimelineEventType.SEVERITY_CHANGED,
        `Severity changed to ${updateIncidentDto.severity}`,
        userId,
        { oldSeverity: existingIncident.severity, newSeverity: updateIncidentDto.severity },
      );
    }

    if (
      updateIncidentDto.assignee &&
      updateIncidentDto.assignee !== existingIncident.assignee?.toString()
    ) {
      await this.createTimelineEvent(id, TimelineEventType.ASSIGNED, 'Assignee updated', userId, {
        newAssignee: updateIncidentDto.assignee,
      });
    }

    Object.assign(existingIncident, updateIncidentDto);
    const updated = await existingIncident.save();
    return updated.populate(['assignee', 'service']);
  }

  async remove(id: string): Promise<void> {
    const result = await this.incidentModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Incident #${id} not found`);
    }
    // Cleanup related documents
    await this.timelineEventModel.deleteMany({ incidentId: id }).exec();
    await this.commentModel.deleteMany({ incidentId: id }).exec();
  }

  async addComment(
    incidentId: string,
    addCommentDto: AddCommentDto,
    userId: string,
  ): Promise<Comment> {
    const incident = await this.incidentModel.findById(incidentId).exec();
    if (!incident) {
      throw new NotFoundException(`Incident #${incidentId} not found`);
    }

    const comment = new this.commentModel({
      incidentId,
      content: addCommentDto.content,
      author: userId,
    });

    await comment.save();

    await this.createTimelineEvent(
      incidentId,
      TimelineEventType.COMMENTED,
      'Added a comment',
      userId,
    );

    return comment.populate('author', 'name email avatar');
  }

  async getComments(incidentId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ incidentId })
      .sort({ createdAt: 1 })
      .populate('author', 'name email avatar')
      .exec();
  }

  async getTimeline(incidentId: string): Promise<TimelineEvent[]> {
    return this.timelineEventModel
      .find({ incidentId })
      .sort({ createdAt: -1 })
      .populate('actor', 'name email avatar')
      .exec();
  }

  async addAttachment(
    incidentId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Incident> {
    const incident = await this.incidentModel.findById(incidentId).exec();
    if (!incident) {
      throw new NotFoundException(`Incident #${incidentId} not found`);
    }

    const attachment = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedBy: new Types.ObjectId(userId),
    };

    incident.attachments.push(attachment as any);
    await incident.save();

    await this.createTimelineEvent(
      incidentId,
      TimelineEventType.ATTACHMENT_ADDED,
      `Attached file: ${file.originalname}`,
      userId,
    );

    return incident;
  }

  private async createTimelineEvent(
    incidentId: string,
    type: TimelineEventType,
    description: string,
    actorId?: string,
    metadata?: any,
  ) {
    const event = new this.timelineEventModel({
      incidentId,
      type,
      description,
      actor: actorId,
      metadata,
    });
    await event.save();
  }
}
