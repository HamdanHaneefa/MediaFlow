import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectsContext';
import { useContacts } from '@/contexts/ContactsContext';
import { useTasks } from '@/contexts/TasksContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Edit
} from 'lucide-react';
import { ProjectOverviewTab } from '@/components/projects/ProjectOverviewTab';
import { ProjectTeamTab } from '@/components/projects/ProjectTeamTab';
import { ProjectTasksTab } from '@/components/projects/ProjectTasksTab';
import { ProjectTimelineTab } from '@/components/projects/ProjectTimelineTab';
import { ProjectFilesTab } from '@/components/projects/ProjectFilesTab';
import { ProjectNotesTab } from '@/components/projects/ProjectNotesTab';
import { format } from 'date-fns';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById } = useProjects();
  const { getContactById } = useContacts();
  const { tasks } = useTasks();

  const project = id ? getProjectById(id) : undefined;
  const client = project?.client_id ? getContactById(project.client_id) : undefined;

  const projectTasks = tasks.filter(task => task.project_id === id);
  const completedTasks = projectTasks.filter(task => task.status === 'Done');
  const progress = projectTasks.length > 0
    ? Math.round((completedTasks.length / projectTasks.length) * 100)
    : 0;

  if (!project) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/projects')}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500">Project not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Pre-production': return 'bg-purple-100 text-purple-800';
      case 'Production': return 'bg-orange-100 text-orange-800';
      case 'Post-production': return 'bg-cyan-100 text-cyan-800';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/projects')}
        className="text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm sm:text-base">Back to Projects</span>
      </Button>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:justify-between mb-4">
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 break-words">{project.title}</h1>
                <Badge className={`${getStatusColor(project.status)} text-xs sm:text-sm`}>
                  {project.status}
                </Badge>
                <Badge className={`${getPhaseColor(project.phase)} text-xs sm:text-sm`}>
                  {project.phase}
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-slate-600">{project.type}</p>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Edit Project
            </Button>
          </div>

          {client && (
            <div className="bg-slate-50 rounded-lg p-3 sm:p-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarFallback className="bg-blue-600 text-white text-sm sm:text-base">
                    {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-900">Client</p>
                  <p className="text-sm sm:text-base text-slate-900 font-semibold truncate">{client.name}</p>
                  {client.company && (
                    <p className="text-xs sm:text-sm text-slate-600 truncate">{client.company}</p>
                  )}
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                  {client.email && (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}
                  {client.phone && (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                <p className="text-xs sm:text-sm text-slate-600">Budget</p>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 break-all">
                {project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                <p className="text-xs sm:text-sm text-slate-600">Start Date</p>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">
                {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'Not set'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                <p className="text-xs sm:text-sm text-slate-600">End Date</p>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">
                {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'Not set'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                <p className="text-xs sm:text-sm text-slate-600">Team</p>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">
                {project.team_members.length} members
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-slate-700">Project Progress</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">{progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {completedTasks.length} of {projectTasks.length} tasks completed
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="w-full min-w-max justify-start border-b border-slate-200 rounded-none bg-transparent p-0 px-4 sm:px-6">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                Team
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                Files
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                Notes
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent value="overview" className="mt-0">
              <ProjectOverviewTab project={project} />
            </TabsContent>

            <TabsContent value="team" className="mt-0">
              <ProjectTeamTab project={project} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <ProjectTasksTab project={project} />
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <ProjectTimelineTab project={project} />
            </TabsContent>

            <TabsContent value="files" className="mt-0">
              <ProjectFilesTab project={project} />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <ProjectNotesTab project={project} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
