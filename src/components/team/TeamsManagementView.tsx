import { useState } from 'react';
import { Plus, Users, User, FolderOpen, Edit, Trash2, UserPlus, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { TeamCreationDialog } from './TeamCreationDialog';

export function TeamsManagementView() {
  const { teams, deleteTeam } = useTeam();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  const handleDeleteTeam = (teamId: string) => {
    setTeamToDelete(teamId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (teamToDelete) {
      await deleteTeam(teamToDelete);
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const getInitials = (member: { first_name?: string; last_name?: string; name?: string }) => {
    // Handle API format (first_name, last_name) or legacy format (name)
    const name = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const getFullName = (member: { first_name?: string; last_name?: string; name?: string }) => {
    // Handle API format (first_name, last_name) or legacy format (name)
    return member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
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
          className="flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors active:scale-95 select-none"
          style={{ pointerEvents: 'auto' }}
          type="button"
        >
          <Plus className="w-4 h-4 pointer-events-none" />
          <span className="pointer-events-none">Create Team</span>
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const manager = team.manager;
          const teamMembersCount = team._count?.members || 0;
          const projectsCount = team._count?.team_project_assignments || 0;

          return (
            <Card key={team.id} className="hover:shadow-lg transition-all duration-200 cursor-default">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2 cursor-default">
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="cursor-pointer hover:bg-gray-100 transition-colors active:scale-95 select-none"
                        style={{ pointerEvents: 'auto' }}
                        type="button"
                      >
                        <MoreHorizontal className="h-4 w-4 pointer-events-none" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 cursor-pointer hover:bg-red-50 transition-colors"
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
                  {manager ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(manager)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{getFullName(manager)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No manager assigned</span>
                  )}
                </div>

                {/* Team Members Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Team Members</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {teamMembersCount}
                  </Badge>
                </div>

                {/* Projects Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Assigned Projects</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {projectsCount}
                  </Badge>
                </div>

                {/* Team Members Preview */}
                {team.members && team.members.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">Members</span>
                    <div className="flex flex-wrap gap-2">
                      {team.members.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-xs">
                              {getInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{getFullName(member).split(' ')[0]}</span>
                        </div>
                      ))}
                      {team.members.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{team.members.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned Projects Preview */}
                {team.team_project_assignments && team.team_project_assignments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">Projects</span>
                    <div className="flex flex-wrap gap-1">
                      {team.team_project_assignments.slice(0, 2).map((assignment) => (
                        <Badge key={assignment.project.id} variant="outline" className="text-xs">
                          {assignment.project.title}
                        </Badge>
                      ))}
                      {team.team_project_assignments.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{team.team_project_assignments.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 cursor-pointer hover:bg-gray-50 transition-colors active:scale-95 select-none"
                    style={{ pointerEvents: 'auto' }}
                    type="button"
                  >
                    <UserPlus className="h-3 w-3 mr-1 pointer-events-none" />
                    <span className="pointer-events-none">Add Member</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 cursor-pointer hover:bg-gray-50 transition-colors active:scale-95 select-none"
                    style={{ pointerEvents: 'auto' }}
                    type="button"
                  >
                    <FolderOpen className="h-3 w-3 mr-1 pointer-events-none" />
                    <span className="pointer-events-none">Assign Project</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {teams.length === 0 && (
          <Card className="col-span-full border-dashed border-2 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams created yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first team to organize members and manage project access.
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                className="flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors active:scale-95 select-none"
                style={{ pointerEvents: 'auto' }}
                type="button"
              >
                <Plus className="w-4 h-4 pointer-events-none" />
                <span className="pointer-events-none">Create Your First Team</span>
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
            <AlertDialogCancel className="cursor-pointer hover:bg-gray-100 transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 cursor-pointer transition-colors"
            >
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
