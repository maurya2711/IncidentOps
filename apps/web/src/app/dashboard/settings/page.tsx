'use client';

import { useTheme } from 'next-themes';
import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Check,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  Shield,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notificationsApi, settingsApi } from '@/lib/api/settings';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'theme', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'sessions', label: 'Sessions', icon: Shield },
];

// ── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: settingsApi.getProfile,
  });

  const mutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings', 'profile'] });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({
      name: fd.get('name') as string,
      bio: fd.get('bio') as string,
      timezone: fd.get('timezone') as string,
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your public name, bio, and timezone.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary uppercase">
              {profile?.name?.charAt(0) ?? '?'}
            </div>
            <div>
              <p className="font-semibold">{profile?.name}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {profile?.role}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" defaultValue={profile?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={profile?.bio ?? ''}
              placeholder="Tell your team about yourself..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              name="timezone"
              defaultValue={profile?.timezone ?? 'UTC'}
              placeholder="e.g. Asia/Kolkata"
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Password Tab ─────────────────────────────────────────────────────────────
function PasswordTab() {
  const mutation = useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: () => toast.success('Password changed successfully'),
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to change password'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPassword = fd.get('newPassword') as string;
    const confirm = fd.get('confirmPassword') as string;
    if (newPassword !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    mutation.mutate({ currentPassword: fd.get('currentPassword') as string, newPassword });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Choose a strong password. Minimum 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" minLength={8} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              required
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Theme Tab ─────────────────────────────────────────────────────────────────
function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how IncidentOps looks on your device.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 max-w-md">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150',
                theme === value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6',
                  theme === value ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  theme === value ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {theme === value && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const PREFS = [
    { id: 'incident_created', label: 'New Incident', desc: 'When a new incident is opened' },
    {
      id: 'incident_assigned',
      label: 'Assigned to Me',
      desc: 'When an incident is assigned to you',
    },
    {
      id: 'incident_resolved',
      label: 'Incident Resolved',
      desc: 'When an incident you follow is resolved',
    },
    {
      id: 'incident_commented',
      label: 'New Comment',
      desc: 'When someone comments on an incident',
    },
    { id: 'service_down', label: 'Service Down', desc: 'When a service status changes to outage' },
  ];

  const [prefs, setPrefs] = useState<Record<string, { email: boolean; inApp: boolean }>>(
    Object.fromEntries(PREFS.map((p) => [p.id, { email: true, inApp: true }])),
  );

  const toggle = (id: string, channel: 'email' | 'inApp') =>
    setPrefs((prev) => ({ ...prev, [id]: { ...prev[id], [channel]: !prev[id][channel] } }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which events trigger email and in-app notifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground pr-4">Event</th>
                <th className="py-2 px-4 text-center font-medium text-muted-foreground">Email</th>
                <th className="py-2 px-4 text-center font-medium text-muted-foreground">In-App</th>
              </tr>
            </thead>
            <tbody>
              {PREFS.map((pref) => (
                <tr key={pref.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </td>
                  {(['email', 'inApp'] as const).map((ch) => (
                    <td key={ch} className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggle(pref.id, ch)}
                        className={cn(
                          'h-5 w-5 rounded border-2 transition-all flex items-center justify-center mx-auto',
                          prefs[pref.id][ch]
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/40',
                        )}
                      >
                        {prefs[pref.id][ch] && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button className="mt-4" onClick={() => toast.success('Preferences saved')}>
          <Check className="mr-2 h-4 w-4" /> Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Sessions Tab ──────────────────────────────────────────────────────────────
function SessionsTab() {
  const qc = useQueryClient();
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['settings', 'sessions'],
    queryFn: settingsApi.getSessions,
  });

  const revokeMutation = useMutation({
    mutationFn: settingsApi.revokeSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings', 'sessions'] });
      toast.success('Session revoked');
    },
    onError: () => toast.error('Failed to revoke session'),
  });

  const revokeAllMutation = useMutation({
    mutationFn: settingsApi.revokeAllSessions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings', 'sessions'] });
      toast.success('All other sessions revoked');
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Devices currently signed into your account.</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => revokeAllMutation.mutate()}
          disabled={revokeAllMutation.isPending}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" /> Revoke All Others
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No session data available
          </p>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((session: any) => (
              <div key={session.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium truncate max-w-xs">
                      {session.userAgent || 'Unknown device'}
                    </p>
                    {session.isCurrent && (
                      <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    IP: {session.ipAddress || 'Unknown'} ·{' '}
                    {session.lastUsed
                      ? formatDistanceToNow(new Date(session.lastUsed), { addSuffix: true })
                      : 'Recently'}
                  </p>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => revokeMutation.mutate(session.id)}
                    disabled={revokeMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, appearance, and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="flex md:flex-col gap-1 md:w-48 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left w-full',
                activeTab === id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'password' && <PasswordTab />}
          {activeTab === 'theme' && <AppearanceTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'sessions' && <SessionsTab />}
        </div>
      </div>
    </div>
  );
}
