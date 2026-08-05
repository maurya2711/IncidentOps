import { PaginatedResponse, Service } from '@incidentops/shared';

import api from '../api';

export const servicesApi = {
  findAll: async (params?: Record<string, any>) => {
    const { data } = await api.get<PaginatedResponse<Service>>('/services', { params });
    return (data as any)?.data ?? data;
  },

  findOne: async (id: string) => {
    const { data } = await api.get<Service>(`/services/${id}`);
    return (data as any)?.data ?? data;
  },

  create: async (serviceData: Partial<Service>) => {
    const { data } = await api.post<Service>('/services', serviceData);
    return (data as any)?.data ?? data;
  },

  update: async (id: string, serviceData: Partial<Service>) => {
    const { data } = await api.patch<Service>(`/services/${id}`, serviceData);
    return (data as any)?.data ?? data;
  },

  remove: async (id: string) => {
    await api.delete(`/services/${id}`);
  },

  getMetrics: async (id: string, days: number = 7) => {
    const { data } = await api.get<any[]>(`/services/${id}/metrics`, { params: { days } });
    return (data as any)?.data ?? data;
  },

  getStatusSummary: async () => {
    const { data } = await api.get<Record<string, number>>('/services/status-summary');
    return (data as any)?.data ?? data;
  },
};
