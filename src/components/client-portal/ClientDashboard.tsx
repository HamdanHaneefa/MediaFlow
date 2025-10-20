import { Project } from '../../types';
import { useClientPortal } from '../../contexts/ClientPortalContext';
import { useTasks } from '../../contexts/TasksContext';
import { useEvents } from '../../contexts/EventsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { format, isAfter } from 'date-fns';

interface ClientDashboardProps {
  project: Project;
}

export function ClientDashboard({ project }: ClientDashboardProps) {
  const { assets, reviews, messages } = useClientPortal();
  const { tasks } = useTasks();
  const { events } = useEvents();

  const projectAssets = assets.filter((a) => a.project_id === project.id);
  const projectReviews = reviews.filter((r) => r.project_id === project.id);
  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  const projectEvents = events.filter((e) => e.project_id === project.id);

  const pendingReviews = projectReviews.filter((r) => r.status === 'Pending' || r.status === 'In Review');
  const approvedAssets = projectAssets.filter((a) => a.status === 'Approved' || a.status === 'Final');
  const unreadMessages = messages.filter((m) => !m.is_read && m.recipient_id);

  const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length;
  const totalTasks = projectTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const upcomingEvents = projectEvents
    .filter((e) => isAfter(new Date(e.start_time), new Date()) && e.status !== 'Cancelled')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3);

  const recentUpdates = [
    ...projectAssets.map((a) => ({
      id: a.id,
      type: 'asset',
      title: `New ${a.file_type.toLowerCase()}: ${a.name}`,
      timestamp: a.created_at,
      status: a.status,
    })),
    ...messages.slice(0, 5).map((m) => ({
      id: m.id,
      type: 'message',
      title: m.message_text.substring(0, 50) + (m.message_text.length > 50 ? '...' : ''),
      timestamp: m.created_at,
      status: m.message_type,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Project Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{progressPercentage.toFixed(0)}%</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-gray-500 mt-2">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingReviews.length}</div>
            <p className="text-xs text-gray-500 mt-2">
              {pendingReviews.length === 0 ? 'All caught up!' : 'Awaiting your review'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved Assets</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{approvedAssets.length}</div>
            <p className="text-xs text-gray-500 mt-2">
              Ready for download
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unread Messages</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{unreadMessages.length}</div>
            <p className="text-xs text-gray-500 mt-2">
              {unreadMessages.length === 0 ? 'All caught up!' : 'New updates from team'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Milestones</CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events scheduled</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(event.start_time), 'MMM d, yyyy • h:mm a')}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                      )}
                    </div>
                    <Badge variant="outline">{event.event_type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest project updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUpdates.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentUpdates.map((update) => (
                  <div key={update.id} className="flex items-start gap-3">
                    <div className="rounded-lg bg-gray-50 p-2">
                      {update.type === 'asset' ? (
                        <FileText className="h-4 w-4 text-gray-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{update.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(update.timestamp), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {update.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {pendingReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Action Required: Pending Reviews</CardTitle>
            <CardDescription>These items are waiting for your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReviews.map((review) => {
                const asset = projectAssets.find((a) => a.id === review.asset_id);
                if (!asset) return null;

                return (
                  <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="rounded-lg bg-orange-50 p-2">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        <p className="text-sm text-gray-600">{asset.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{asset.file_type}</Badge>
                          {review.deadline && (
                            <span className="text-xs text-gray-500">
                              Due: {format(new Date(review.deadline), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
