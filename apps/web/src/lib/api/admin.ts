import api from '../api';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  isInvitePending: boolean;
  invitedBy?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export const adminApi = {
  getUsers: async (page = 1, limit = 20) => {
    const { data } = await api.get('/admin/users', { params: { page, limit } });
    return (data as any)?.data ?? data;
  },

  inviteUser: async (payload: { name: string; email: string; role: string }) => {
    const { data } = await api.post('/admin/users', payload);
    return (data as any)?.data ?? data;
  },

  resendInvite: async (userId: string) => {
    const { data } = await api.post(`/admin/users/${userId}/resend-invite`);
    return (data as any)?.data ?? data;
  },

  updateUser: async (userId: string, payload: { role?: string; isActive?: boolean }) => {
    const { data } = await api.patch(`/admin/users/${userId}`, payload);
    return (data as any)?.data ?? data;
  },

  deleteUser: async (userId: string) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return (data as any)?.data ?? data;
  },

  acceptInvite: async (payload: { token: string; password: string }) => {
    const { data } = await api.post('/auth/accept-invite', payload);
    return (data as any)?.data ?? data;
  },
};
