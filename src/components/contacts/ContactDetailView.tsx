import { Contact, Project, Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Edit,
  Trash2,
  Send,
  FileText,
  Tag,
} from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ContactDetailViewProps {
  contact: Contact;
  projects: Project[];
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

export function ContactDetailView({
  contact,
  projects,
  tasks,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ContactDetailViewProps) {
  const relatedProjects = projects.filter(
    (p) => p.client_id === contact.id || p.team_members.includes(contact.id)
  );

  const relatedTasks = tasks.filter((t) => t.assigned_to === contact.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Contact Details</SheetTitle>
          <SheetDescription>View and manage contact information</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-semibold">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900">{contact.name}</h3>
                  {contact.company && (
                    <p className="text-slate-600 mt-1 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {contact.company}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {contact.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        contact.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : contact.status === 'Prospect'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }
                    >
                      {contact.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>

                {contact.phone && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    Added {formatDistanceToNow(parseISO(contact.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {contact.tags && contact.tags.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                      <Tag className="w-4 h-4" />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {contact.notes && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </div>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                </>
              )}

              <Separator className="my-6" />

              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => onEdit(contact)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this contact?')) {
                      onDelete(contact.id);
                      onOpenChange(false);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Projects ({relatedProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedProjects.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  No projects associated with this contact
                </p>
              ) : (
                <div className="space-y-3">
                  {relatedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{project.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {project.type}
                          </Badge>
                          <Badge
                            variant={project.status === 'Active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        {project.phase}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tasks ({relatedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedTasks.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  No tasks assigned to this contact
                </p>
              ) : (
                <div className="space-y-3">
                  {relatedTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-3 rounded-lg border border-slate-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              task.priority === 'High'
                                ? 'destructive'
                                : task.priority === 'Medium'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      {task.due_date && (
                        <div className="text-xs text-slate-500">
                          {format(parseISO(task.due_date), 'MMM d')}
                        </div>
                      )}
                    </div>
                  ))}
                  {relatedTasks.length > 5 && (
                    <p className="text-xs text-slate-500 text-center pt-2">
                      +{relatedTasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
