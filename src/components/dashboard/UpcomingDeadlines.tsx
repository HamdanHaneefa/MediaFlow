import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, parseISO, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { Task, Contact, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';

interface UpcomingDeadlinesProps {
  tasks: Task[];
  contacts: Contact[];
}

function getPriorityColor(priority: TaskPriority) {
  switch (priority) {
    case 'High':
      return 'destructive';
    case 'Medium':
      return 'default';
    case 'Low':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getDateLabel(dateString: string) {
  const date = parseISO(dateString);

  if (isPast(date) && !isToday(date)) {
    return { label: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50' };
  }
  if (isToday(date)) {
    return { label: 'Today', color: 'text-orange-600', bgColor: 'bg-orange-50' };
  }
  if (isTomorrow(date)) {
    return { label: 'Tomorrow', color: 'text-amber-600', bgColor: 'bg-amber-50' };
  }

  const days = differenceInDays(date, new Date());
  if (days <= 7) {
    return { label: `${days}d`, color: 'text-blue-600', bgColor: 'bg-blue-50' };
  }

  return { label: format(date, 'MMM d'), color: 'text-slate-600', bgColor: 'bg-slate-50' };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UpcomingDeadlines({ tasks, contacts }: UpcomingDeadlinesProps) {
  const tasksWithDueDates = tasks
    .filter((task) => task.due_date && task.status !== 'Completed')
    .sort((a, b) => {
      if (!a.due_date || !b.due_date) return 0;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 5);

  const getAssignedContact = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.assigned_to) return null;
    return contacts.find((c) => c.id === task.assigned_to);
  };

  if (tasksWithDueDates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No upcoming deadlines</p>
            <p className="text-sm text-slate-400 mt-1">
              Tasks with due dates will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overdueCount = tasksWithDueDates.filter(
    (task) => task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Deadlines</span>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {overdueCount} Overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasksWithDueDates.map((task) => {
            const assignedContact = getAssignedContact(task.id);
            const dateInfo = task.due_date ? getDateLabel(task.due_date) : null;

            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-slate-900 text-sm leading-tight">
                      {task.title}
                    </h4>
                    <Badge
                      variant={getPriorityColor(task.priority)}
                      className="text-xs flex-shrink-0"
                    >
                      {task.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {dateInfo && (
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                          dateInfo.bgColor,
                          dateInfo.color
                        )}
                      >
                        {dateInfo.label === 'Overdue' && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {dateInfo.label === 'Today' || dateInfo.label === 'Tomorrow' ? (
                          <Calendar className="w-3 h-3" />
                        ) : null}
                        <span>{dateInfo.label}</span>
                      </div>
                    )}

                    {task.type && (
                      <Badge variant="outline" className="text-xs">
                        {task.type}
                      </Badge>
                    )}

                    {assignedContact && (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                            {getInitials(assignedContact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-600">
                          {assignedContact.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {tasks.filter((t) => t.due_date && t.status !== 'Completed').length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all tasks ({tasks.filter((t) => t.due_date && t.status !== 'Completed').length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
