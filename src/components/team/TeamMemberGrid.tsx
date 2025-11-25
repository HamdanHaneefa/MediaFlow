import React, { useState } from 'react';
import { MoreHorizontal, Mail, Phone, Edit, Trash2, Shield, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { TeamMember, TeamInvitation } from '@/types';
import { useTeam } from '@/contexts/TeamContext';
import { formatDistanceToNow } from 'date-fns';

interface TeamMemberGridProps {
  teamMembers: TeamMember[];
  invitations: TeamInvitation[];
  onEditMember: (memberId: string) => void;
}

const roleColors = {
  'Owner': 'bg-purple-100 text-purple-800',
  'Manager': 'bg-blue-100 text-blue-800',
  'Producer': 'bg-green-100 text-green-800',
  'Director': 'bg-orange-100 text-orange-800',
  'Editor': 'bg-pink-100 text-pink-800',
  'Camera Operator': 'bg-yellow-100 text-yellow-800',
  'Audio Engineer': 'bg-indigo-100 text-indigo-800',
  'Assistant': 'bg-gray-100 text-gray-800',
  'Freelancer': 'bg-red-100 text-red-800',
};

const statusColors = {
  'Active': 'bg-green-100 text-green-800',
  'Inactive': 'bg-gray-100 text-gray-800',
  'On Leave': 'bg-yellow-100 text-yellow-800',
  'Terminated': 'bg-red-100 text-red-800',
};

export function TeamMemberGrid({ teamMembers, invitations, onEditMember }: TeamMemberGridProps) {
  const { deleteTeamMember, deleteInvitation } = useTeam();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const handleDeleteMember = (memberId: string) => {
    setMemberToDelete(memberId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteTeamMember(memberToDelete);
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPermissionLevel = (member: TeamMember): string => {
    const permissions = member.permissions;
    const trueCount = Object.values(permissions).filter(Boolean).length;
    
    if (trueCount >= 6) return 'Full Access';
    if (trueCount >= 3) return 'Limited Access';
    return 'View Only';
  };

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Members ({teamMembers.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar_url} alt={member.name} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      {member.last_active && (
                        <p className="text-xs text-gray-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Active {formatDistanceToNow(new Date(member.last_active), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditMember(member.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Role</span>
                    <Badge variant="secondary" className={roleColors[member.role] || 'bg-gray-100 text-gray-800'}>
                      {member.role}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Status</span>
                    <Badge variant="secondary" className={statusColors[member.status]}>
                      {member.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Access Level</span>
                    <Badge variant="outline">
                      <Shield className="w-3 h-3 mr-1" />
                      {getPermissionLevel(member)}
                    </Badge>
                  </div>

                  {member.hourly_rate && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Rate</span>
                      <span className="text-sm font-medium">${member.hourly_rate}/hr</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Projects</span>
                    <span className="text-sm font-medium">{member.assigned_projects.length}</span>
                  </div>
                </div>

                {member.skills && member.skills.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {member.performance_metrics && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium">{member.performance_metrics.tasks_completed}</div>
                        <div className="text-gray-500">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{member.performance_metrics.client_satisfaction_rating.toFixed(1)}</div>
                        <div className="text-gray-500">Rating</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {member.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                      className="flex-1"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                  )}
                  {member.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${member.phone}`, '_blank')}
                      className="flex-1"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Invitations ({invitations.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          Invited
                        </h4>
                        <p className="text-sm text-gray-500 truncate">{invitation.email}</p>
                        <p className="text-xs text-gray-400">
                          Sent {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => deleteInvitation(invitation.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancel Invitation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Role</span>
                      <Badge variant="secondary" className={roleColors[invitation.role] || 'bg-gray-100 text-gray-800'}>
                        {invitation.role}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <Badge variant="outline" className="text-yellow-600">
                        {invitation.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Expires</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {invitation.message && (
                    <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      {invitation.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone.
              They will lose access to all projects and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
