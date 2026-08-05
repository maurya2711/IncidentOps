import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Incident } from '@incidentops/shared';

import { incidentsApi } from '@/lib/api/incidents';

export const useIncidentsQuery = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => incidentsApi.findAll(params),
  });
};

export const useIncidentQuery = (id: string) => {
  return useQuery({
    queryKey: ['incidents', id],
    queryFn: () => incidentsApi.findOne(id),
    enabled: !!id,
  });
};

export const useIncidentTimelineQuery = (id: string) => {
  return useQuery({
    queryKey: ['incidents', id, 'timeline'],
    queryFn: () => incidentsApi.getTimeline(id),
    enabled: !!id,
  });
};

export const useIncidentCommentsQuery = (id: string) => {
  return useQuery({
    queryKey: ['incidents', id, 'comments'],
    queryFn: () => incidentsApi.getComments(id),
    enabled: !!id,
  });
};

export const useCreateIncidentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Incident>) => incidentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

export const useUpdateIncidentMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Incident>) => incidentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents', id, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

export const useAddCommentMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => incidentsApi.addComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', id, 'timeline'] });
    },
  });
};

export const useUploadAttachmentMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => incidentsApi.uploadAttachment(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents', id, 'timeline'] });
    },
  });
};
