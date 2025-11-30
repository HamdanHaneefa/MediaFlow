import { Event } from '@/services/api/events';
import { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';

interface TimelineViewProps {
  projects: Project[];
  events: Event[];
  onEventClick: (event: Event) => void;
  onProjectClick: (project: Project) => void;
}

const phaseColors = {
  'Pre-production': 'bg-purple-100 text-purple-800 border-purple-200',
  'Production': 'bg-orange-100 text-orange-800 border-orange-200',
  'Post-production': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const eventTypeIcons = {
  Shoot: '🎬',
  Meeting: '👥',
  Deadline: '⏰',
  Milestone: '🎯',
  Delivery: '📦',
};

export function TimelineView({ projects, events, onEventClick, onProjectClick }: TimelineViewProps) {
  const activeProjects = projects.filter(p => p.status === 'Active').sort((a, b) => {
    const aDate = a.start_date ? new Date(a.start_date) : new Date();
    const bDate = b.start_date ? new Date(b.start_date) : new Date();
    return aDate.getTime() - bDate.getTime();
  });

  const getProjectEvents = (projectId: string) => {
    return events
      .filter(e => e.project_id === projectId)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const calculateProgress = (project: Project) => {
    if (!project.start_date || !project.end_date) return 0;

    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const today = new Date();

    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(today, start);

    const progress = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
    return Math.round(progress);
  };

  return (
    <div className="space-y-6">
      {activeProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500">No active projects to display</p>
        </Card>
      ) : (
        activeProjects.map((project) => {
          const projectEvents = getProjectEvents(project.id);
          const progress = calculateProgress(project);

          return (
            <Card key={project.id} className="overflow-hidden">
              <div
                className="p-4 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onProjectClick(project)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-600">{project.type}</p>
                  </div>
                  <Badge className={phaseColors[project.phase]} variant="outline">
                    {project.phase}
                  </Badge>
                </div>

                {project.start_date && project.end_date && (
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(project.start_date), 'MMM d, yyyy')}</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(project.end_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                )}

                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-900">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {projectEvents.length > 0 && (
                <div className="p-4">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

                    <div className="space-y-4">
                      {projectEvents.map((event) => {
                        const isCompleted = event.status === 'Completed';
                        const isPast = new Date(event.start_time) < new Date() && event.status !== 'Completed';

                        return (
                          <div
                            key={event.id}
                            className="relative pl-10 cursor-pointer hover:bg-slate-50 -ml-2 p-2 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            <div className="absolute left-2.5 top-3.5 w-3 h-3 rounded-full border-2 border-white bg-slate-400">
                              {isCompleted ? (
                                <CheckCircle2 className="w-3 h-3 text-green-600 -mt-0.5 -ml-0.5" />
                              ) : (
                                <Circle
                                  className={cn(
                                    'w-3 h-3 -mt-0.5 -ml-0.5',
                                    isPast ? 'text-red-500' : 'text-blue-500'
                                  )}
                                />
                              )}
                            </div>

                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{eventTypeIcons[event.event_type as keyof typeof eventTypeIcons] || '📅'}</span>
                                  <h4 className="font-medium text-slate-900">{event.title}</h4>
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {event.event_type}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{format(parseISO(event.start_time), 'MMM d, yyyy')}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                      {format(parseISO(event.start_time), 'HH:mm')} -{' '}
                                      {format(parseISO(event.end_time), 'HH:mm')}
                                    </span>
                                  </div>
                                </div>

                                {event.description && (
                                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                              </div>

                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  isCompleted && 'bg-green-100 text-green-800 border-green-200',
                                  isPast && !isCompleted && 'bg-red-100 text-red-800 border-red-200'
                                )}
                              >
                                {event.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {projectEvents.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No events scheduled for this project
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
