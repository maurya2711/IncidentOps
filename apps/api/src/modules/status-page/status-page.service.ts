import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IncidentStatus, ServiceStatus } from '@incidentops/shared';

@Injectable()
export class StatusPageService {
  constructor(
    @InjectModel('Service') private serviceModel: Model<any>,
    @InjectModel('Incident') private incidentModel: Model<any>,
  ) {}

  async getOverallStatus() {
    const services = await this.serviceModel.find().select('name status uptime latency').lean();

    const hasOutage = services.some((s: any) => s.status === ServiceStatus.MAJOR_OUTAGE);
    const hasDegraded = services.some(
      (s: any) => s.status === ServiceStatus.DEGRADED || s.status === ServiceStatus.PARTIAL_OUTAGE,
    );

    const overall = hasOutage ? 'major_outage' : hasDegraded ? 'degraded' : 'operational';

    const avgUptime =
      services.length > 0
        ? services.reduce((sum: number, s: any) => sum + (s.uptime ?? 100), 0) / services.length
        : 100;

    return {
      overall,
      avgUptime: parseFloat(avgUptime.toFixed(2)),
      serviceCount: services.length,
      affectedCount: services.filter(
        (s: any) =>
          s.status !== ServiceStatus.OPERATIONAL && s.status !== ServiceStatus.MAINTENANCE,
      ).length,
    };
  }

  async getServices() {
    return this.serviceModel
      .find()
      .select('name status uptime latency errorRate tags')
      .sort({ name: 1 })
      .lean();
  }

  async getActiveIncidents() {
    return this.incidentModel
      .find({
        status: {
          $in: [IncidentStatus.OPEN, IncidentStatus.ACKNOWLEDGED, IncidentStatus.INVESTIGATING],
        },
      })
      .select('title severity status createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  }

  async getIncidentHistory(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.incidentModel
      .find({
        status: IncidentStatus.RESOLVED,
        resolvedAt: { $gte: since },
      })
      .select('title severity status createdAt resolvedAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async getUptime90Days() {
    const services = await this.serviceModel.find().select('name status uptime').lean();
    return services.map((s: any) => ({
      name: s.name,
      status: s.status,
      uptime: s.uptime ?? 100,
    }));
  }
}
