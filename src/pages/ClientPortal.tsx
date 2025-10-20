import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useClientPortal } from '../contexts/ClientPortalContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useContacts } from '../contexts/ContactsContext';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Clock,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { ClientDashboard } from '../components/client-portal/ClientDashboard';
import { ReviewApprovalView } from '../components/client-portal/ReviewApprovalView';
import { CommunicationHub } from '../components/client-portal/CommunicationHub';

export default function ClientPortal() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProjects();
  const { contacts } = useContacts();
  const { reviews, messages, fetchAssetsByProject, fetchReviewsByProject, fetchMessagesByProject } = useClientPortal();
  const [activeTab, setActiveTab] = useState('dashboard');

  const project = projects.find((p) => p.id === projectId);
  const client = project?.client_id ? contacts.find((c) => c.id === project.client_id) : null;

  useEffect(() => {
    if (projectId) {
      fetchAssetsByProject(projectId);
      fetchReviewsByProject(projectId);
      fetchMessagesByProject(projectId);
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>The requested project could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const pendingReviews = reviews.filter((r) => r.status === 'Pending' || r.status === 'In Review');
  const unreadMessages = messages.filter((m) => !m.is_read);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{project.title}</h1>
              <p className="text-gray-600 mt-1">{project.description}</p>
              {client && (
                <p className="text-sm text-gray-500 mt-2">Client: {client.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  project.status === 'Active'
                    ? 'default'
                    : project.status === 'Completed'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {project.status}
              </Badge>
              <Badge variant="outline">{project.phase}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                {project.start_date && format(new Date(project.start_date), 'MMM d, yyyy')}
                {project.end_date && ` - ${format(new Date(project.end_date), 'MMM d, yyyy')}`}
              </span>
            </div>
            {pendingReviews.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-gray-700">{pendingReviews.length} pending approval{pendingReviews.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {unreadMessages.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-gray-700">{unreadMessages.length} unread message{unreadMessages.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b bg-white">
            <div className="container mx-auto px-6">
              <TabsList className="bg-transparent border-b-0 h-auto p-0">
                <TabsTrigger
                  value="dashboard"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
                >
                  Reviews & Approvals
                  {pendingReviews.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingReviews.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="communication"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
                >
                  Communication
                  {unreadMessages.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadMessages.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-6 py-6">
              <TabsContent value="dashboard" className="mt-0">
                <ClientDashboard project={project} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <ReviewApprovalView projectId={project.id} />
              </TabsContent>

              <TabsContent value="communication" className="mt-0">
                <CommunicationHub projectId={project.id} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
