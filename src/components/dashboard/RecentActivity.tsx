import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clapperboard, UserPlus, CheckCircle2, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Contact, Project, Task } from '@/types';

type ActivityType = 'project_update' | 'contact_added' | 'task_completed' | 'upcoming_deadline';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    project?: Project;
    contact?: Contact;
    task?: Task;
  };
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'project_update':
      return Clapperboard;
    case 'contact_added':
      return UserPlus;
    case 'task_completed':
      return CheckCircle2;
    case 'upcoming_deadline':
      return Clock;
    default:
      return FileText;
  }
}

function getActivityColor(type: ActivityType) {
  switch (type) {
    case 'project_update':
      return 'bg-blue-100 text-blue-700';
    case 'contact_added':
      return 'bg-green-100 text-green-700';
    case 'task_completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'upcoming_deadline':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

interface RecentActivityProps {
  projects: Project[];
  contacts: Contact[];
  tasks: Task[];
}

export function RecentActivity({ projects, contacts, tasks }: RecentActivityProps) {
  const activities: Activity[] = [];

  projects.slice(0, 3).forEach((project) => {
    activities.push({
      id: `project-${project.id}`,
      type: 'project_update',
      title: 'Project Updated',
      description: `${project.title} moved to ${project.phase}`,
      timestamp: project.updated_at,
      metadata: { project },
    });
  });

  contacts.slice(0, 2).forEach((contact) => {
    activities.push({
      id: `contact-${contact.id}`,
      type: 'contact_added',
      title: 'New Contact Added',
      description: `${contact.name} from ${contact.company || 'N/A'}`,
      timestamp: contact.created_at,
      metadata: { contact },
    });
  });

  tasks
    .filter((task) => task.status === 'Done')
    .slice(0, 3)
    .forEach((task) => {
      activities.push({
        id: `task-${task.id}`,
        type: 'task_completed',
        title: 'Task Completed',
        description: task.title,
        timestamp: task.updated_at,
        metadata: { task },
      });
    });

  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  if (sortedActivities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-slate-500">No recent activity yet</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Activity will appear here as you work
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {sortedActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div key={activity.id} className="flex items-start gap-2 sm:gap-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-xs sm:text-sm">
                        {activity.title}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5 truncate">
                        {activity.description}
                      </p>
                    </div>
                    {activity.metadata?.task?.priority && (
                      <Badge
                        variant={
                          activity.metadata.task.priority === 'High'
                            ? 'destructive'
                            : activity.metadata.task.priority === 'Medium'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs flex-shrink-0"
                      >
                        {activity.metadata.task.priority}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
