import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTeam } from '@/contexts/TeamContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { TeamMember } from '@/types';
import { Plus, Users, DollarSign, X } from 'lucide-react';

export function TeamAssignmentView() {
  const { teamMembers = [], projectAssignments = [], assignToProject, removeFromProject, fetchProjectAssignments } = useTeam();
  const { projects = [] } = useProjects();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Ensure we have the latest assignment data when component mounts
  useEffect(() => {
    fetchProjectAssignments();
  }, [fetchProjectAssignments]); // Now fetchProjectAssignments is memoized with useCallback

  const [assignmentForm, setAssignmentForm] = useState({
    team_member_id: '',
    role_in_project: '',
    is_lead: false,
    responsibilities: [] as string[],
    hourly_rate_override: '',
  });

  const [formErrors, setFormErrors] = useState({
    team_member_id: false,
    role_in_project: false,
    project: false,
  });

  const [newResponsibility, setNewResponsibility] = useState('');

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMemberName = (member: { name?: string; first_name?: string; last_name?: string }) => {
    if (member.name) return member.name;
    if (member.first_name && member.last_name) return `${member.first_name} ${member.last_name}`;
    if (member.first_name) return member.first_name;
    return 'Unknown Member';
  };

  const getMemberAvatar = (member: { avatar_url?: string; avatar?: string }) => {
    return member.avatar_url || member.avatar;
  };

  const handleAssignMember = async () => {
    console.log('Form data:', {
      selectedProject,
      team_member_id: assignmentForm.team_member_id,
      role_in_project: assignmentForm.role_in_project
    });

    // Reset errors
    setFormErrors({
      team_member_id: false,
      role_in_project: false,
      project: false,
    });

    // Validate form
    const errors = {
      project: !selectedProject,
      team_member_id: !assignmentForm.team_member_id,
      role_in_project: !assignmentForm.role_in_project.trim(),
    };

    if (errors.project || errors.team_member_id || errors.role_in_project) {
      setFormErrors(errors);
      console.log('Validation failed:', errors);
      return;
    }

    try {
      const result = await assignToProject({
        project_id: selectedProject,
        team_member_id: assignmentForm.team_member_id,
        role_in_project: assignmentForm.role_in_project,
        assigned_at: new Date().toISOString(),
        assigned_by: 'current-user-id', // Would come from auth context
        is_lead: assignmentForm.is_lead,
        responsibilities: assignmentForm.responsibilities,
        hourly_rate_override: assignmentForm.hourly_rate_override 
          ? parseFloat(assignmentForm.hourly_rate_override) 
          : undefined,
      });

      if (result) {
        console.log('Assignment successful:', result);
        // Reset form
        setAssignmentForm({
          team_member_id: '',
          role_in_project: '',
          is_lead: false,
          responsibilities: [],
          hourly_rate_override: '',
        });
        setSelectedProject('');
        setShowAssignDialog(false);
        setFormErrors({
          team_member_id: false,
          role_in_project: false,
          project: false,
        });
      } else {
        console.error('Assignment failed: No result returned');
      }
    } catch (error) {
      console.error('Assignment failed with error:', error);
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim() && !assignmentForm.responsibilities.includes(newResponsibility.trim())) {
      setAssignmentForm(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()],
      }));
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (responsibility: string) => {
    setAssignmentForm(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter(r => r !== responsibility),
    }));
  };

  const getTeamMembersByProject = (projectId: string) => {
    if (!projectAssignments || !teamMembers) return [];
    
    const assignments = projectAssignments.filter(a => a.project_id === projectId);
    
    return assignments.map(assignment => {
      const member = teamMembers.find(m => m.id === assignment.team_member_id);
      return member ? { ...member, assignment } : null;
    }).filter(Boolean) as unknown as (TeamMember & { assignment: typeof projectAssignments[0] })[];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Assignments</h3>
          <p className="text-sm text-gray-500">Assign team members to projects and manage their roles</p>
        </div>
        <Button 
          onClick={() => setShowAssignDialog(true)} 
          className="flex items-center justify-center gap-2 px-4 py-2 min-w-fit"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span>Assign Member</span>
        </Button>
      </div>

      {/* Projects with Team Assignments */}
      <div className="space-y-4">
        {projects.map((project) => {
          const assignedMembers = getTeamMembersByProject(project.id);
          
          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">{project.type}</Badge>
                      <Badge variant="secondary">{project.status}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {assignedMembers.length} member{assignedMembers.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(project.id);
                      setShowAssignDialog(true);
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-1 min-w-fit"
                  >
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    <span>Assign</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {assignedMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedMembers.map((memberWithAssignment) => {
                      const { assignment, ...member } = memberWithAssignment;
                      return (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={getMemberAvatar(member)} alt={getMemberName(member)} />
                              <AvatarFallback className="text-xs">
                                {getInitials(getMemberName(member))}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{getMemberName(member)}</span>
                                {assignment.is_lead && (
                                  <Badge variant="outline" className="text-xs">Lead</Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{assignment.role_in_project}</div>
                              {assignment.responsibilities.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {assignment.responsibilities.slice(0, 2).join(', ')}
                                  {assignment.responsibilities.length > 2 && '...'}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {assignment.hourly_rate_override && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${assignment.hourly_rate_override}/hr
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromProject(assignment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No team members assigned to this project</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Team Member to Project</DialogTitle>
            <DialogDescription>
              Select a team member and define their role in the project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!selectedProject && (
              <div>
                <Label htmlFor="project">Project *</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className={formErrors.project ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.project && (
                  <p className="text-sm text-red-500 mt-1">Please select a project</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="member">Team Member *</Label>
              <Select 
                value={assignmentForm.team_member_id} 
                onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, team_member_id: value }))}
              >
                <SelectTrigger className={formErrors.team_member_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers && teamMembers.length > 0 ? (
                    teamMembers
                      .filter(member => member && member.status === 'active')
                      .map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={getMemberAvatar(member)} alt={getMemberName(member)} />
                              <AvatarFallback className="text-xs">
                                {getInitials(getMemberName(member))}
                              </AvatarFallback>
                            </Avatar>
                            <span>{getMemberName(member)}</span>
                            <Badge variant="outline" className="ml-auto">
                              {member.role || 'No Role'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No active team members available</div>
                  )}
                </SelectContent>
              </Select>
              {formErrors.team_member_id && (
                <p className="text-sm text-red-500 mt-1">Please select a team member</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role in Project *</Label>
                <Input
                  id="role"
                  value={assignmentForm.role_in_project}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, role_in_project: e.target.value }))}
                  placeholder="e.g., Lead Editor, Camera Operator"
                  className={formErrors.role_in_project ? "border-red-500" : ""}
                />
                {formErrors.role_in_project && (
                  <p className="text-sm text-red-500 mt-1">Please enter a role</p>
                )}
              </div>
              <div>
                <Label htmlFor="rate">Hourly Rate Override ($)</Label>
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={assignmentForm.hourly_rate_override}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, hourly_rate_override: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_lead"
                checked={assignmentForm.is_lead}
                onCheckedChange={(checked) => setAssignmentForm(prev => ({ ...prev, is_lead: checked }))}
              />
              <Label htmlFor="is_lead">Project Lead</Label>
            </div>

            <div>
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  placeholder="Add responsibility..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                />
                <Button type="button" variant="outline" onClick={addResponsibility}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {assignmentForm.responsibilities.map((responsibility, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {responsibility}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeResponsibility(responsibility)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignMember}>
              Assign Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
