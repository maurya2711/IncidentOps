import { Team } from '@incidentops/shared';

import api from '../api';

export const teamsApi = {
  findAll: async () => {
    const { data } = await api.get<Team[]>('/teams');
    return (data as any)?.data ?? data;
  },
  findOne: async (id: string) => {
    const { data } = await api.get<Team>(`/teams/${id}`);
    return (data as any)?.data ?? data;
  },
  create: async (teamData: { name: string; description?: string; slackChannel?: string }) => {
    const { data } = await api.post<Team>('/teams', teamData);
    return (data as any)?.data ?? data;
  },
  update: async (
    id: string,
    teamData: Partial<{ name: string; description: string; slackChannel: string }>,
  ) => {
    const { data } = await api.patch<Team>(`/teams/${id}`, teamData);
    return (data as any)?.data ?? data;
  },
  remove: async (id: string) => {
    await api.delete(`/teams/${id}`);
  },
  addMember: async (teamId: string, userId: string, role?: string) => {
    const { data } = await api.post<Team>(`/teams/${teamId}/members`, { userId, role });
    return (data as any)?.data ?? data;
  },
  updateMember: async (
    teamId: string,
    userId: string,
    updates: { role?: string; isAvailable?: boolean },
  ) => {
    const { data } = await api.patch<Team>(`/teams/${teamId}/members/${userId}`, updates);
    return (data as any)?.data ?? data;
  },
  removeMember: async (teamId: string, userId: string) => {
    const { data } = await api.delete<Team>(`/teams/${teamId}/members/${userId}`);
    return (data as any)?.data ?? data;
  },
};
