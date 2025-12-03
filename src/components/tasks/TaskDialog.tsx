import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { useTasks } from '@/contexts/TasksContext';
import { useContacts } from '@/contexts/ContactsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  projectId?: string;
}

export function TaskDialog({ open, onOpenChange, task, projectId }: TaskDialogProps) {
  const { createTask, updateTask } = useTasks();
  const { contacts } = useContacts();
  const { getProjectById } = useProjects();
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do' as TaskStatus,
    project_id: projectId || '',
    assigned_to: 'unassigned',
    priority: 'Medium' as TaskPriority,
    type: 'Creative' as TaskType,
  });

  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        project_id: task.project_id || '',
        assigned_to: task.assigned_to || 'unassigned',
        priority: task.priority,
        type: task.type || 'Creative',
      });
      if (task.due_date) setDueDate(new Date(task.due_date));
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'To Do',
        project_id: projectId || '',
        assigned_to: 'unassigned',
        priority: 'Medium',
        type: 'Creative',
      });
      setDueDate(undefined);
    }
  }, [task, projectId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        project_id: formData.project_id || undefined,
        assigned_to: formData.assigned_to === 'unassigned' ? undefined : formData.assigned_to,
      };

      if (isEditing) {
        await updateTask(task.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await createTask(taskData);
        toast.success('Task created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save task');
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const project = formData.project_id ? getProjectById(formData.project_id) : undefined;
  const availableAssignees = project
    ? contacts.filter(c => project.team_members.includes(c.id))
    : contacts.filter(c => c.status === 'Active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update task details' : 'Fill in the information to create a new task'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as TaskType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assign To</Label>
            <Select
              value={formData.assigned_to}
              onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {availableAssignees.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{contact.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {project && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Project:</span> {project.title}
              </p>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
