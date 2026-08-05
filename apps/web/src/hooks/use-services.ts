import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Service } from '@incidentops/shared';

import { servicesApi } from '@/lib/api/services';

export const useServicesQuery = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => servicesApi.findAll(params),
  });
};

export const useServiceQuery = (id: string) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.findOne(id),
    enabled: !!id,
  });
};

export const useServiceMetricsQuery = (id: string, days: number = 7) => {
  return useQuery({
    queryKey: ['services', id, 'metrics', days],
    queryFn: () => servicesApi.getMetrics(id, days),
    enabled: !!id,
  });
};

export const useServiceStatusSummaryQuery = () => {
  return useQuery({
    queryKey: ['services', 'status-summary'],
    queryFn: () => servicesApi.getStatusSummary(),
  });
};

export const useCreateServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Service>) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateServiceMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Service>) => servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
