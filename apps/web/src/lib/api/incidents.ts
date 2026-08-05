import { Comment, Incident, PaginatedResponse, TimelineEvent } from '@incidentops/shared';

import api from '../api';

export const incidentsApi = {
  findAll: async (params?: Record<string, any>) => {
    const { data } = await api.get<PaginatedResponse<Incident>>('/incidents', { params });
    return (data as any)?.data ?? data;
  },

  findOne: async (id: string) => {
    const { data } = await api.get<Incident>(`/incidents/${id}`);
    return (data as any)?.data ?? data;
  },

  create: async (incidentData: Partial<Incident>) => {
    const { data } = await api.post<Incident>('/incidents', incidentData);
    return (data as any)?.data ?? data;
  },

  update: async (id: string, incidentData: Partial<Incident>) => {
    const { data } = await api.patch<Incident>(`/incidents/${id}`, incidentData);
    return (data as any)?.data ?? data;
  },

  getTimeline: async (id: string) => {
    const { data } = await api.get<TimelineEvent[]>(`/incidents/${id}/timeline`);
    return (data as any)?.data ?? data;
  },

  getComments: async (id: string) => {
    const { data } = await api.get<Comment[]>(`/incidents/${id}/comments`);
    return (data as any)?.data ?? data;
  },

  addComment: async (id: string, content: string) => {
    const { data } = await api.post<Comment>(`/incidents/${id}/comments`, { content });
    return (data as any)?.data ?? data;
  },

  uploadAttachment: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<Incident>(`/incidents/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return (data as any)?.data ?? data;
  },
};
