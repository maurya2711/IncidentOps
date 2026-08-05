import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationType } from '@incidentops/shared';

import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
    resourceId?: string;
    resourceModel?: string;
  }): Promise<Notification> {
    const notification = new this.notificationModel({
      ...data,
      userId: new Types.ObjectId(data.userId),
      resourceId: data.resourceId ? new Types.ObjectId(data.resourceId) : undefined,
    });
    return notification.save();
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { userId: new Types.ObjectId(userId) };

    const [data, total, unreadCount] = await Promise.all([
      this.notificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({ ...filter, read: false }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: { total, page, limit, totalPages, unreadCount },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId: new Types.ObjectId(userId) },
      { read: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { read: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false,
    });
  }

  async deleteNotification(userId: string, notificationId: string): Promise<any> {
    return this.notificationModel.deleteOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });
  }
}
