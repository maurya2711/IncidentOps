import api from '../api';

export const analyticsApi = {
  getSummary: async (days = 30) => {
    const { data } = await api.get('/analytics/summary', { params: { days } });
    return (data as any)?.data ?? data;
  },
  getIncidentTrend: async (days = 30) => {
    const { data } = await api.get('/analytics/incident-trend', { params: { days } });
    return (data as any)?.data ?? data;
  },
  getMttr: async (days = 30) => {
    const { data } = await api.get('/analytics/mttr', { params: { days } });
    return (data as any)?.data ?? data;
  },
  getIncidentsBySeverity: async (days = 30) => {
    const { data } = await api.get('/analytics/incidents-by-severity', { params: { days } });
    return (data as any)?.data ?? data;
  },
  getTopFailingServices: async (limit = 10) => {
    const { data } = await api.get('/analytics/top-failing-services', { params: { limit } });
    return (data as any)?.data ?? data;
  },
  getSlaCompliance: async (days = 30) => {
    const { data } = await api.get('/analytics/sla-compliance', { params: { days } });
    return (data as any)?.data ?? data;
  },
};
