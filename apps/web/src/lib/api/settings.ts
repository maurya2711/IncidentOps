import api from '../api';

export const notificationsApi = {
  findAll: async (page = 1, limit = 20) => {
    const { data } = await api.get('/notifications', { params: { page, limit } });
    return (data as any)?.data ?? data;
  },
  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count');
    return (data as any)?.data ?? data;
  },
  markAsRead: async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return (data as any)?.data ?? data;
  },
  markAllAsRead: async () => {
    const { data } = await api.patch('/notifications/read-all');
    return (data as any)?.data ?? data;
  },
  deleteNotification: async (id: string) => {
    await api.delete(`/notifications/${id}`);
  },
};

export const settingsApi = {
  getProfile: async () => {
    const { data } = await api.get('/settings/profile');
    return (data as any)?.data ?? data;
  },
  updateProfile: async (dto: { name?: string; bio?: string; timezone?: string }) => {
    const { data } = await api.patch('/settings/profile', dto);
    return (data as any)?.data ?? data;
  },
  changePassword: async (dto: { currentPassword: string; newPassword: string }) => {
    const { data } = await api.post('/settings/change-password', dto);
    return (data as any)?.data ?? data;
  },
  getSessions: async () => {
    const { data } = await api.get('/settings/sessions');
    return (data as any)?.data ?? data;
  },
  revokeSession: async (sessionId: string) => {
    const { data } = await api.post(`/settings/sessions/${sessionId}/revoke`);
    return (data as any)?.data ?? data;
  },
  revokeAllSessions: async () => {
    const { data } = await api.post('/settings/sessions/revoke-all');
    return (data as any)?.data ?? data;
  },
};
