import { useState } from 'react';
import { Plus, Users, User, FolderOpen, Edit, Trash2, UserPlus, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTeam } from '@/contexts/TeamContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { TeamCreationDialog } from './TeamCreationDialog';

export function TeamsManagementView() {
  const { state, deleteTeam } = useTeam();
  const { projects } = useProjects();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  const handleDeleteTeam = (teamId: string) => {
    setTeamToDelete(teamId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (teamToDelete) {
      deleteTeam(teamToDelete);
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Teams Management</h2>
          <p className="text-slate-600">
            Create and manage teams with restricted project access. Team members will only see projects assigned to their team.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Team-Based Project Access</h3>
              <p className="text-sm text-blue-700 mt-1">
                When team members are assigned to a team, they will only see projects that are assigned to their team. 
                This ensures better project organization and data security. Managers can still see all projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.teams.map((team) => {
          const manager = state.teamMembers.find(member => member.id === team.manager_id);
          const teamMembers = state.teamMembers.filter(member => 
            team.member_ids.includes(member.id)
          );

          return (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {team.name}
                    </CardTitle>
                    {team.description && (
                      <CardDescription className="mt-2">
                        {team.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Manager */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Manager</span>
                  {manager && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={manager.avatar_url} alt={manager.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(manager.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{manager.name}</span>
                    </div>
                  )}
                </div>

                {/* Team Members Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Team Members</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {team.member_ids.length}
                  </Badge>
                </div>

                {/* Projects Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Assigned Projects</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {team.project_ids.length}
                  </Badge>
                </div>

                {/* Team Members Preview */}
                {teamMembers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">Members</span>
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={member.avatar_url} alt={member.name} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{member.name.split(' ')[0]}</span>
                        </div>
                      ))}
                      {teamMembers.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{teamMembers.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned Projects Preview */}
                {team.project_ids.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">Projects</span>
                    <div className="flex flex-wrap gap-1">
                      {team.project_ids.slice(0, 2).map((projectId) => (
                        <Badge key={projectId} variant="outline" className="text-xs">
                          {getProjectName(projectId)}
                        </Badge>
                      ))}
                      {team.project_ids.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{team.project_ids.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add Member
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FolderOpen className="h-3 w-3 mr-1" />
                    Assign Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {state.teams.length === 0 && (
          <Card className="col-span-full border-dashed border-2 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams created yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first team to organize members and manage project access.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Team
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Team Creation Dialog */}
      <TeamCreationDialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? This will remove all project assignments 
              and team memberships. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
