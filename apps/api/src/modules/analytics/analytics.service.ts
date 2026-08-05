import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IncidentSeverity, IncidentStatus, ServiceStatus } from '@incidentops/shared';

import { Incident } from '../incidents/schemas/incident.schema';
import { Service } from '../services/schemas/service.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel('Incident') private incidentModel: Model<any>,
    @InjectModel('Service') private serviceModel: Model<any>,
  ) {}

  private dateRangeFilter(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return since;
  }

  async getSummary(days: number = 30) {
    const since = this.dateRangeFilter(days);
    const prevSince = new Date(since);
    prevSince.setDate(prevSince.getDate() - days);

    const [totalIncidents, activeIncidents, resolvedInPeriod, services] = await Promise.all([
      this.incidentModel.countDocuments({ createdAt: { $gte: since } }),
      this.incidentModel.countDocuments({
        status: {
          $in: [IncidentStatus.OPEN, IncidentStatus.ACKNOWLEDGED, IncidentStatus.INVESTIGATING],
        },
      }),
      this.incidentModel.countDocuments({
        status: IncidentStatus.RESOLVED,
        resolvedAt: { $gte: since },
      }),
      this.serviceModel.find().select('uptime status').lean(),
    ]);

    const avgUptime =
      services.length > 0
        ? services.reduce((sum: number, s: any) => sum + (s.uptime ?? 100), 0) / services.length
        : 100;

    // MTTR: avg minutes from creation to resolution
    const resolvedWithTimes = await this.incidentModel
      .find({
        status: IncidentStatus.RESOLVED,
        resolvedAt: { $gte: since },
        createdAt: { $exists: true },
      })
      .select('createdAt resolvedAt')
      .lean();

    const mttr =
      resolvedWithTimes.length > 0
        ? resolvedWithTimes.reduce((sum: number, i: any) => {
            const diff = new Date(i.resolvedAt).getTime() - new Date(i.createdAt).getTime();
            return sum + diff / 60000; // ms → minutes
          }, 0) / resolvedWithTimes.length
        : 0;

    return {
      totalIncidents,
      activeIncidents,
      resolvedToday: resolvedInPeriod,
      averageUptimePercent: parseFloat(avgUptime.toFixed(2)),
      mttr: parseFloat(mttr.toFixed(1)),
      mttd: 0, // Placeholder — detection time requires alert integration
    };
  }

  async getIncidentTrend(days: number = 30) {
    const since = this.dateRangeFilter(days);

    const [created, resolved] = await Promise.all([
      this.incidentModel.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      this.incidentModel.aggregate([
        { $match: { status: IncidentStatus.RESOLVED, resolvedAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$resolvedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge into a unified date map
    const dateMap: Record<string, { date: string; created: number; resolved: number }> = {};

    // Populate date range with zeros
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = { date: key, created: 0, resolved: 0 };
    }

    created.forEach((c: any) => {
      if (dateMap[c._id]) dateMap[c._id].created = c.count;
    });
    resolved.forEach((r: any) => {
      if (dateMap[r._id]) dateMap[r._id].resolved = r.count;
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getMttrBySeverity(days: number = 30) {
    const since = this.dateRangeFilter(days);

    const result = await this.incidentModel.aggregate([
      {
        $match: {
          status: IncidentStatus.RESOLVED,
          resolvedAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: '$severity',
          avgMinutes: {
            $avg: {
              $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 60000],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const bySeverity: Record<string, number> = {
      [IncidentSeverity.CRITICAL]: 0,
      [IncidentSeverity.HIGH]: 0,
      [IncidentSeverity.MEDIUM]: 0,
      [IncidentSeverity.LOW]: 0,
    };

    result.forEach((r: any) => {
      if (r._id in bySeverity) bySeverity[r._id] = parseFloat(r.avgMinutes.toFixed(1));
    });

    const allMinutes = result.map((r: any) => r.avgMinutes);
    const averageMinutes =
      allMinutes.length > 0
        ? parseFloat(
            (allMinutes.reduce((a: number, b: number) => a + b, 0) / allMinutes.length).toFixed(1),
          )
        : 0;

    return { averageMinutes, bySeverity };
  }

  async getIncidentsBySeverity(days: number = 30) {
    const since = this.dateRangeFilter(days);
    return this.incidentModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
  }

  async getTopFailingServices(limit: number = 10) {
    return this.incidentModel.aggregate([
      { $match: { service: { $exists: true, $ne: null } } },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$service.name', 'Unknown Service'] },
          status: { $ifNull: ['$service.status', ServiceStatus.UNKNOWN] },
          count: 1,
        },
      },
    ]);
  }

  async getSlaCompliance(days: number = 30) {
    const since = this.dateRangeFilter(days);

    // SLA targets in minutes per severity
    const slaTargets: Record<string, number> = {
      [IncidentSeverity.CRITICAL]: 60,
      [IncidentSeverity.HIGH]: 240,
      [IncidentSeverity.MEDIUM]: 1440,
      [IncidentSeverity.LOW]: 4320,
    };

    const results = await this.incidentModel.aggregate([
      {
        $match: {
          status: IncidentStatus.RESOLVED,
          resolvedAt: { $gte: since },
        },
      },
      {
        $addFields: {
          resolutionMinutes: {
            $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 60000],
          },
        },
      },
      {
        $group: {
          _id: '$severity',
          total: { $sum: 1 },
          withinSla: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    '$resolutionMinutes',
                    {
                      $switch: {
                        branches: Object.entries(slaTargets).map(([sev, target]) => ({
                          case: { $eq: ['$severity', sev] },
                          then: target,
                        })),
                        default: 99999,
                      },
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return Object.entries(slaTargets).map(([severity, target]) => {
      const found = results.find((r: any) => r._id === severity);
      const total = found?.total ?? 0;
      const withinSla = found?.withinSla ?? 0;
      return {
        severity,
        target,
        total,
        withinSla,
        compliance: total > 0 ? parseFloat(((withinSla / total) * 100).toFixed(1)) : 100,
      };
    });
  }
}
