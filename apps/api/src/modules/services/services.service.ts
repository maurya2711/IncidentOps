import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';

import { PaginatedResponse, ServiceStatus } from '@incidentops/shared';

import { CreateServiceDto } from './dto/create-service.dto';
import { AddMetricDto, ServiceQueryDto } from './dto/service-query.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceDocument } from './schemas/service.schema';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private serviceModel: Model<ServiceDocument>) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const statusBadgeToken = randomBytes(16).toString('hex');
    const service = new this.serviceModel({
      ...createServiceDto,
      statusBadgeToken,
    });
    return service.save();
  }

  async findAll(query: ServiceQueryDto): Promise<PaginatedResponse<Service>> {
    const { page = 1, limit = 20, status, search, team } = query;
    const filter: any = {};

    if (status) filter.status = status;
    if (team) filter.team = new Types.ObjectId(team);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.serviceModel
        .find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .populate('team', 'name')
        .select('-metrics') // Exclude heavy metrics array from list
        .exec(),
      this.serviceModel.countDocuments(filter),
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

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceModel
      .findById(id)
      .populate('team', 'name description members')
      .exec();
    if (!service) throw new NotFoundException(`Service #${id} not found`);
    return service;
  }

  async findByBadgeToken(token: string): Promise<Service> {
    const service = await this.serviceModel
      .findOne({ statusBadgeToken: token })
      .select('name status')
      .exec();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.serviceModel
      .findByIdAndUpdate(id, updateServiceDto, { new: true })
      .populate('team', 'name')
      .exec();
    if (!service) throw new NotFoundException(`Service #${id} not found`);
    return service;
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`Service #${id} not found`);
  }

  async addMetric(id: string, addMetricDto: AddMetricDto): Promise<void> {
    const metricPoint = {
      timestamp: new Date(),
      ...addMetricDto,
    };

    // Keep only last 2016 points (7 days at 5-min intervals)
    await this.serviceModel
      .findByIdAndUpdate(id, {
        $push: {
          metrics: {
            $each: [metricPoint],
            $slice: -2016,
          },
        },
        $set: {
          latency: addMetricDto.latency,
          errorRate: addMetricDto.errorRate,
        },
      })
      .exec();
  }

  async getMetrics(id: string, days: number = 7): Promise<any[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const service = await this.serviceModel.findById(id).select('metrics').exec();

    if (!service) throw new NotFoundException(`Service #${id} not found`);

    return (service as any).metrics?.filter((m: any) => new Date(m.timestamp) >= since) ?? [];
  }

  async getStatusSummary(): Promise<Record<ServiceStatus, number>> {
    const result = await this.serviceModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const summary: Record<string, number> = {
      [ServiceStatus.OPERATIONAL]: 0,
      [ServiceStatus.DEGRADED]: 0,
      [ServiceStatus.PARTIAL_OUTAGE]: 0,
      [ServiceStatus.MAJOR_OUTAGE]: 0,
      [ServiceStatus.MAINTENANCE]: 0,
      [ServiceStatus.UNKNOWN]: 0,
    };

    result.forEach(({ _id, count }) => {
      if (_id in summary) summary[_id] = count;
    });

    return summary as Record<ServiceStatus, number>;
  }
}
