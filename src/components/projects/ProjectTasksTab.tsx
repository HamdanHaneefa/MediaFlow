import { useState } from 'react';
import { Project, Task, TaskStatus } from '@/types';
import { useTasks } from '@/contexts/TasksContext';
import { useContacts } from '@/contexts/ContactsContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { TaskDialog } from '@/components/tasks/TaskDialog';

interface ProjectTasksTabProps {
  project: Project;
}

const taskStatuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done', 'Blocked'];

export function ProjectTasksTab({ project }: ProjectTasksTabProps) {
  const { tasks, updateTask } = useTasks();
  const { getContactById } = useContacts();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const projectTasks = tasks.filter(task => task.project_id === project.id);

  const getTasksByStatus = (status: TaskStatus) => {
    return projectTasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      await updateTask(draggedTask.id, { status });
      setDraggedTask(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">
          Task Board ({projectTasks.length})
        </h3>
        <Button size="sm" onClick={() => setTaskDialogOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 min-w-[600px]">
          {taskStatuses.map((status) => {
            const statusTasks = getTasksByStatus(status);
            return (
              <div
                key={status}
                className="bg-slate-50 rounded-lg p-3 sm:p-4 min-h-[400px] sm:min-h-[500px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status)}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h4 className="text-sm sm:text-base font-semibold text-slate-900">{status}</h4>
                  <Badge variant="secondary" className="bg-slate-200 text-xs">
                    {statusTasks.length}
                  </Badge>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {statusTasks.map((task) => {
                    const assignee = task.assigned_to ? getContactById(task.assigned_to) : null;

                    return (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className="p-2 sm:p-3 cursor-move hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2 sm:space-y-3">
                          <div>
                            <h5 className="text-xs sm:text-sm font-medium text-slate-900 mb-1 break-words">{task.title}</h5>
                            {task.description && (
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <Badge className={`${getPriorityColor(task.priority)} text-xs`} variant="outline">
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.type}
                            </Badge>
                          </div>

                          {task.due_date && (
                            <div className="flex items-center gap-1 sm:gap-2 text-xs text-slate-600">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(task.due_date), 'MMM d')}</span>
                              {new Date(task.due_date) < new Date() && task.status !== 'Done' && (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                              )}
                            </div>
                          )}

                          {assignee && (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                                <AvatarFallback className="bg-blue-600 text-white text-xs">
                                  {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-slate-600 truncate">{assignee.name}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}

                  {statusTasks.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-slate-400 text-xs sm:text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        projectId={project.id}
      />
    </div>
  );
}
