'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Hash, Loader2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Team, TeamMember } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTeamMutation, useTeamsQuery } from '@/hooks/use-teams';

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  member: 'bg-green-500/10 text-green-400 border-green-500/20',
  viewer: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function TeamCard({ team }: { team: Team }) {
  const router = useRouter();
  const memberCount = team.members?.length ?? 0;
  const owner = team.members?.find((m) => m.role === 'owner');

  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 group"
      onClick={() => router.push(`/dashboard/teams/${team._id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base group-hover:text-primary transition-colors">
              {team.name}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Badge>
        </div>
        {team.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 ml-11">
            {team.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex -space-x-2">
          {team.members?.slice(0, 5).map((m: TeamMember, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold uppercase"
              title={(m.user as any)?.name}
            >
              {(m.user as any)?.name?.charAt(0) ?? '?'}
            </div>
          ))}
          {memberCount > 5 && (
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
              +{memberCount - 5}
            </div>
          )}
        </div>
      </CardContent>
      {team.slackChannel && (
        <CardFooter className="pt-0 border-t border-border pb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
            <Hash className="h-3.5 w-3.5" />
            {team.slackChannel}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default function TeamsPage() {
  const { data: teams, isLoading } = useTeamsQuery();
  const createMutation = useCreateTeamMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const description = fd.get('description') as string;
    const slackChannel = fd.get('slackChannel') as string;
    if (!name.trim()) {
      toast.error('Team name is required');
      return;
    }
    try {
      const team = await createMutation.mutateAsync({ name, description, slackChannel });
      toast.success('Team created!');
      setDialogOpen(false);
      router.push(`/dashboard/teams/${team._id}`);
    } catch {
      toast.error('Failed to create team');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your on-call responders into teams
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Team
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : teams?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-muted-foreground">No teams yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Create a team to manage on-call responders
          </p>
          <Button className="mt-4" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams?.map((team: Team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Build a team of on-call responders to manage incidents.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Team Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" placeholder="e.g., Platform Engineering" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                name="description"
                rows={2}
                placeholder="What does this team own?"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slackChannel">Slack Channel (optional)</Label>
              <Input id="slackChannel" name="slackChannel" placeholder="#platform-alerts" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Team
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
