'use client';

import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MoreVertical,
  RefreshCw,
  Shield,
  ShieldAlert,
  Trash2,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { UserRole } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { AdminUser, adminApi } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

const ROLE_BADGES: Record<string, string> = {
  [UserRole.SUPER_ADMIN]: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  [UserRole.ADMIN]: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  [UserRole.MANAGER]: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  [UserRole.MEMBER]: 'bg-green-500/10 text-green-400 border-green-500/30',
  [UserRole.VIEWER]: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const ALLOWED_INVITE_ROLES: Record<string, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MEMBER,
    UserRole.VIEWER,
  ],
  [UserRole.ADMIN]: [UserRole.MANAGER, UserRole.MEMBER, UserRole.VIEWER],
  [UserRole.MANAGER]: [UserRole.MEMBER, UserRole.VIEWER],
  [UserRole.MEMBER]: [],
  [UserRole.VIEWER]: [],
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);

  const actorRole = (currentUser?.role as UserRole) || UserRole.MEMBER;
  const assignableRoles = ALLOWED_INVITE_ROLES[actorRole] || [];

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => adminApi.getUsers(page, 20),
  });

  const inviteMutation = useMutation({
    mutationFn: adminApi.inviteUser,
    onSuccess: (res) => {
      toast.success(res?.message || 'Invitation sent!');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setInviteOpen(false);
      setName('');
      setEmail('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to send invitation');
    },
  });

  const resendMutation = useMutation({
    mutationFn: adminApi.resendInvite,
    onSuccess: (res) => toast.success(res?.message || 'Invite resent!'),
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to resend invite'),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: { role?: string; isActive?: boolean };
    }) => adminApi.updateUser(userId, payload),
    onSuccess: () => {
      toast.success('User updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete user'),
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    inviteMutation.mutate({ name, email, role });
  };

  const users: AdminUser[] = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Invite team members, assign roles, and manage system access.
          </p>
        </div>
        {assignableRoles.length > 0 && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite User
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Team Directory</CardTitle>
          <CardDescription>
            Showing {users.length} of {meta?.total ?? 0} members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 px-4 font-medium text-muted-foreground">User</th>
                    <th className="py-3 px-4 font-medium text-muted-foreground">Role</th>
                    <th className="py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="py-3 px-4 font-medium text-muted-foreground">
                      Joined / Invited
                    </th>
                    <th className="py-3 px-4 font-medium text-muted-foreground text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary uppercase shrink-0">
                              {u.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1">
                                    You
                                  </Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn('text-xs capitalize', ROLE_BADGES[u.role])}
                          >
                            {u.role.replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
                          {!u.isActive ? (
                            <Badge
                              variant="outline"
                              className="bg-red-500/10 text-red-400 border-red-500/30 text-xs"
                            >
                              Deactivated
                            </Badge>
                          ) : u.isInvitePending ? (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs flex items-center w-fit gap-1"
                            >
                              <Clock className="h-3 w-3" /> Invite Pending
                            </Badge>
                          ) : u.isVerified ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-400 border-green-500/30 text-xs flex items-center w-fit gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-500/10 text-gray-400 border-gray-500/30 text-xs"
                            >
                              Unverified
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {u.createdAt
                            ? formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })
                            : '—'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {!isSelf && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {u.isInvitePending && (
                                  <DropdownMenuItem
                                    onClick={() => resendMutation.mutate(u._id)}
                                    disabled={resendMutation.isPending}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" /> Resend Invite
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                {/* Change Role Submenu options */}
                                {assignableRoles.map(
                                  (r) =>
                                    r !== u.role && (
                                      <DropdownMenuItem
                                        key={r}
                                        onClick={() =>
                                          updateMutation.mutate({
                                            userId: u._id,
                                            payload: { role: r },
                                          })
                                        }
                                      >
                                        Make {r.replace('_', ' ')}
                                      </DropdownMenuItem>
                                    ),
                                )}

                                <DropdownMenuSeparator />

                                {u.isActive ? (
                                  <DropdownMenuItem
                                    className="text-amber-500"
                                    onClick={() =>
                                      updateMutation.mutate({
                                        userId: u._id,
                                        payload: { isActive: false },
                                      })
                                    }
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> Deactivate Account
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="text-green-500"
                                    onClick={() =>
                                      updateMutation.mutate({
                                        userId: u._id,
                                        payload: { isActive: true },
                                      })
                                    }
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Reactivate Account
                                  </DropdownMenuItem>
                                )}

                                {actorRole === UserRole.SUPER_ADMIN && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-500"
                                      onClick={() => {
                                        if (
                                          confirm(
                                            `Permanently delete ${u.name}? This action cannot be undone.`,
                                          )
                                        ) {
                                          deleteMutation.mutate(u._id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              An email will be sent to set up their password and activate their account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="inv-name">Full Name</Label>
              <Input
                id="inv-name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-email">Email Address</Label>
              <Input
                id="inv-email"
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inv-role">Role</Label>
              <select
                id="inv-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {assignableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {role === UserRole.MANAGER && 'Managers can lead teams and invite Members/Viewers.'}
                {role === UserRole.ADMIN &&
                  'Admins can manage services, teams, and create Managers/Members.'}
                {role === UserRole.SUPER_ADMIN &&
                  'Super Admins have full unrestricted system authority.'}
                {role === UserRole.MEMBER &&
                  'Members can respond to incidents and manage assigned resources.'}
                {role === UserRole.VIEWER && 'Viewers have read-only access across the platform.'}
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
