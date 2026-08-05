import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { teamsApi } from '@/lib/api/teams';

export const useTeamsQuery = () =>
  useQuery({ queryKey: ['teams'], queryFn: () => teamsApi.findAll() });

export const useTeamQuery = (id: string) =>
  useQuery({ queryKey: ['teams', id], queryFn: () => teamsApi.findOne(id), enabled: !!id });

export const useCreateTeamMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
};

export const useUpdateTeamMutation = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => teamsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', id] }),
  });
};

export const useDeleteTeamMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
};

export const useAddMemberMutation = (teamId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role?: string }) =>
      teamsApi.addMember(teamId, userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', teamId] }),
  });
};

export const useUpdateMemberMutation = (teamId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      ...updates
    }: {
      userId: string;
      role?: string;
      isAvailable?: boolean;
    }) => teamsApi.updateMember(teamId, userId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', teamId] }),
  });
};

export const useRemoveMemberMutation = (teamId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamsApi.removeMember(teamId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', teamId] }),
  });
};
