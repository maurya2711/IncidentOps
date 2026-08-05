'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

import { IncidentSeverity, IncidentStatus, TimelineEventType } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useAddCommentMutation,
  useIncidentCommentsQuery,
  useIncidentQuery,
  useIncidentTimelineQuery,
  useUpdateIncidentMutation,
} from '@/hooks/use-incidents';
import { useAuth } from '@/providers/auth-provider';

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [commentContent, setCommentContent] = useState('');

  const { data: incident, isLoading } = useIncidentQuery(id);
  const { data: timeline } = useIncidentTimelineQuery(id);
  const { data: comments } = useIncidentCommentsQuery(id);

  const updateMutation = useUpdateIncidentMutation(id);
  const addCommentMutation = useAddCommentMutation(id);

  if (isLoading || !incident) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleAcknowledge = async () => {
    try {
      await updateMutation.mutateAsync({ status: IncidentStatus.ACKNOWLEDGED });
      toast.success('Incident acknowledged');
    } catch (e) {
      toast.error('Failed to acknowledge incident');
    }
  };

  const handleResolve = async () => {
    try {
      await updateMutation.mutateAsync({ status: IncidentStatus.RESOLVED });
      toast.success('Incident resolved');
    } catch (e) {
      toast.error('Failed to resolve incident');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      await addCommentMutation.mutateAsync(commentContent);
      setCommentContent('');
      toast.success('Comment added');
    } catch (e) {
      toast.error('Failed to add comment');
    }
  };

  const getTimelineIcon = (type: TimelineEventType) => {
    switch (type) {
      case TimelineEventType.CREATED:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case TimelineEventType.STATUS_CHANGED:
        return <Clock className="h-4 w-4 text-blue-500" />;
      case TimelineEventType.RESOLVED:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case TimelineEventType.COMMENTED:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <Button variant="ghost" onClick={() => router.push('/dashboard/incidents')} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Incidents
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-card p-6 rounded-lg border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              INC-{incident.incidentNumber}
            </span>
            <Badge variant="outline">{incident.status}</Badge>
            <Badge variant="secondary">{incident.severity}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{incident.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {incident.status === IncidentStatus.OPEN && (
            <Button onClick={handleAcknowledge} disabled={updateMutation.isPending}>
              Acknowledge
            </Button>
          )}
          {incident.status !== IncidentStatus.RESOLVED &&
            incident.status !== IncidentStatus.CLOSED && (
              <Button
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-500/10"
                onClick={handleResolve}
                disabled={updateMutation.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Resolve
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {incident.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Timeline & Comments Tabs could go here, for simplicity we stack them */}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted ml-3 space-y-6 pb-4">
                {timeline?.map((event: any) => (
                  <div key={event._id} className="relative pl-6">
                    <span className="absolute -left-3 bg-background p-1 rounded-full border">
                      {getTimelineIcon(event.type)}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{event.description}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {event.actor && (
                        <span className="text-xs text-muted-foreground">by {event.actor.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments?.map((comment: any) => (
                <div key={comment._id} className="flex gap-4 p-4 border rounded-lg bg-muted/20">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                    {comment.author?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{comment.author?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!commentContent.trim() || addCommentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-1 border-b pb-3">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{new Date(incident.createdAt).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 border-b pb-3">
                <span className="text-muted-foreground">Assignee</span>
                <span className="font-medium">{incident.assignee?.name || 'Unassigned'}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 border-b pb-3">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{incident.service?.name || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {incident.tags?.length
                    ? incident.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    : 'None'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No attachments yet.</p>
              <Button variant="outline" className="w-full mt-4" size="sm">
                Upload File
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
