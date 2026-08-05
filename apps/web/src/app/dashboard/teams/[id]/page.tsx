'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  ArrowLeft,
  CheckCircle2,
  Hash,
  Loader2,
  MoreVertical,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Team, TeamMember, TeamRole } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAddMemberMutation,
  useDeleteTeamMutation,
  useRemoveMemberMutation,
  useTeamQuery,
  useUpdateMemberMutation,
} from '@/hooks/use-teams';
import { cn } from '@/lib/utils';

const ROLE_BADGE: Record<string, string> = {
  [TeamRole.OWNER]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  [TeamRole.ADMIN]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [TeamRole.MEMBER]: 'bg-green-500/10 text-green-400 border-green-500/20',
  [TeamRole.VIEWER]: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const PERMISSIONS = [
  { action: 'View Incidents', owner: true, admin: true, member: true, viewer: true },
  { action: 'Create Incidents', owner: true, admin: true, member: true, viewer: false },
  { action: 'Acknowledge Incidents', owner: true, admin: true, member: true, viewer: false },
  { action: 'Resolve Incidents', owner: true, admin: true, member: true, viewer: false },
  { action: 'Manage Team Members', owner: true, admin: true, member: false, viewer: false },
  { action: 'Configure Services', owner: true, admin: true, member: false, viewer: false },
  { action: 'Delete Team', owner: true, admin: false, member: false, viewer: false },
];

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>(TeamRole.MEMBER);
  const [activeTab, setActiveTab] = useState<'members' | 'permissions'>('members');

  const { data: team, isLoading } = useTeamQuery(id);
  const addMemberMutation = useAddMemberMutation(id);
  const updateMemberMutation = useUpdateMemberMutation(id);
  const removeMemberMutation = useRemoveMemberMutation(id);
  const deleteTeamMutation = useDeleteTeamMutation();

  if (isLoading || !team) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId.trim()) return;
    try {
      await addMemberMutation.mutateAsync({ userId: inviteUserId.trim(), role: inviteRole });
      toast.success('Member added');
      setInviteOpen(false);
      setInviteUserId('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this team?`)) return;
    try {
      await removeMemberMutation.mutateAsync(userId);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    try {
      await deleteTeamMutation.mutateAsync(id);
      toast.success('Team deleted');
      router.push('/dashboard/teams');
    } catch {
      toast.error('Failed to delete team');
    }
  };

  const handleRoleChange = async (userId: string, role: TeamRole) => {
    try {
      await updateMemberMutation.mutateAsync({ userId, role });
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleAvailabilityToggle = async (userId: string, isAvailable: boolean) => {
    try {
      await updateMemberMutation.mutateAsync({ userId, isAvailable: !isAvailable });
    } catch {
      toast.error('Failed to update availability');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => router.push('/dashboard/teams')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
      </Button>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <p className="text-sm text-muted-foreground">{team.description || 'No description'}</p>
            {team.slackChannel && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" /> {team.slackChannel}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={handleDeleteTeam}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border w-fit">
        {(['members', 'permissions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'members' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Members ({team.members?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {team.members?.map((member: TeamMember) => {
                const user = member.user as any;
                return (
                  <div key={user?._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                        {user?.name?.charAt(0) ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user?.name ?? 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email ?? ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAvailabilityToggle(user?._id, member.isAvailable)}
                        className={cn(
                          'flex items-center gap-1 text-xs font-medium transition-colors',
                          member.isAvailable ? 'text-green-400' : 'text-muted-foreground',
                        )}
                        title={
                          member.isAvailable
                            ? 'Available — click to mark unavailable'
                            : 'Unavailable — click to mark available'
                        }
                      >
                        {member.isAvailable ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {member.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs border',
                          ROLE_BADGE[member.role] ?? ROLE_BADGE[TeamRole.VIEWER],
                        )}
                      >
                        {member.role}
                      </Badge>
                      {member.role !== TeamRole.OWNER && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user._id, TeamRole.ADMIN)}
                            >
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user._id, TeamRole.MEMBER)}
                            >
                              Make Member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user._id, TeamRole.VIEWER)}
                            >
                              Make Viewer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveMember(user._id, user.name)}
                            >
                              Remove from team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'permissions' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Permissions Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                      Action
                    </th>
                    {['Owner', 'Admin', 'Member', 'Viewer'].map((r) => (
                      <th
                        key={r}
                        className="py-2 px-4 text-center font-medium text-muted-foreground"
                      >
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((p) => (
                    <tr key={p.action} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4">{p.action}</td>
                      {[p.owner, p.admin, p.member, p.viewer].map((allowed, i) => (
                        <td key={i} className="py-2.5 px-4 text-center">
                          {allowed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                placeholder="Paste MongoDB user _id"
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                You can find user IDs in the Users management section.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={TeamRole.MEMBER}>Member</option>
                <option value={TeamRole.ADMIN}>Admin</option>
                <option value={TeamRole.VIEWER}>Viewer</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMemberMutation.isPending}>
                {addMemberMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
