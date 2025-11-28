import { useState } from 'react';
import { Plus, Users, UserPlus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeam } from '@/contexts/TeamContext';
import { TeamMemberGrid } from '@/components/team/TeamMemberGrid';
import { TeamMemberDialog } from '@/components/team/TeamMemberDialog';
import { TeamInvitationDialog } from '@/components/team/TeamInvitationDialog';
import { TeamAssignmentView } from '@/components/team/TeamAssignmentView';
import { TeamDashboard } from '@/components/team/TeamDashboard';
import { TeamSettings } from '@/components/team/TeamSettings';
import { TeamsManagementView } from '@/components/team/TeamsManagementView';
import type { TeamMember, TeamInvitation } from '@/types/team';

export default function Team() {
  const { teamMembers } = useTeam();
  const [activeTab, setActiveTab] = useState('members');
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showInvitationDialog, setShowInvitationDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const handleEditMember = (memberId: string) => {
    setEditingMember(memberId);
    setShowMemberDialog(true);
  };

  const handleCloseDialog = () => {
    setShowMemberDialog(false);
    setEditingMember(null);
  };

  const activeMembers = teamMembers.filter(member => member.status === 'active');
  const pendingInvitations: unknown[] = []; // TODO: Add invitations to context
  const activeTeams = 0; // TODO: Add teams to context
  const projectAssignments: unknown[] = []; // TODO: Add project assignments to context

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-slate-600 mt-2">
            Manage team members, roles, and project assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInvitationDialog(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </Button>
          <Button
            onClick={() => setShowMemberDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              +{teamMembers.filter(m => m.status === 'active' && 
                new Date(m.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTeams}</div>
            <p className="text-xs text-muted-foreground">
              Teams created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvitations.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Assignments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>
                Manage your team members, their roles, and project assignments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="members" className="mt-6">
              <TeamMemberGrid
                teamMembers={teamMembers as unknown as TeamMember[]}
                onEditMember={handleEditMember}
                invitations={pendingInvitations as unknown as TeamInvitation[]}
              />
            </TabsContent>
            
            <TabsContent value="teams" className="mt-6">
              <TeamsManagementView />
            </TabsContent>
            
            <TabsContent value="assignments" className="mt-6">
              <TeamAssignmentView />
            </TabsContent>
            
            <TabsContent value="dashboard" className="mt-6">
              <TeamDashboard />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <TeamSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TeamMemberDialog
        open={showMemberDialog}
        onClose={handleCloseDialog}
        editingMemberId={editingMember}
      />

      <TeamInvitationDialog
        open={showInvitationDialog}
        onClose={() => setShowInvitationDialog(false)}
      />
    </div>
  );
}
