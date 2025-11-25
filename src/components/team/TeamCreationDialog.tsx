import React, { useState } from 'react';
import { Users, User, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeam } from '@/contexts/TeamContext';
import { useProjects } from '@/contexts/ProjectsContext';

interface TeamCreationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TeamCreationDialog({ open, onClose }: TeamCreationDialogProps) {
  const { state, createTeam } = useTeam();
  const { projects } = useProjects();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: '',
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const managers = state.teamMembers.filter(
    member => member.permissions.can_manage_team && member.status === 'Active'
  );

  const availableMembers = state.teamMembers.filter(
    member => member.status === 'Active'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.manager_id) {
      return;
    }

    createTeam({
      name: formData.name.trim(),
      description: formData.description.trim(),
      manager_id: formData.manager_id,
      member_ids: selectedMembers,
      project_ids: selectedProjects,
      created_by: formData.manager_id, // In real app, this would be current user
    });

    // Reset form
    setFormData({ name: '', description: '', manager_id: '' });
    setSelectedMembers([]);
    setSelectedProjects([]);
    onClose();
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Team
          </DialogTitle>
          <DialogDescription>
            Create a team and assign members and projects to it. Team members will only see projects assigned to their team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name *</Label>
              <Input
                id="team-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter team name"
                required
              />
            </div>

            <div>
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the team's purpose and responsibilities"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="team-manager">Team Manager *</Label>
              <Select
                value={formData.manager_id}
                onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={manager.avatar_url} alt={manager.name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(manager.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{manager.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {manager.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Team Members ({selectedMembers.length} selected)
            </Label>
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {availableMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={selectedMembers.includes(member.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleMemberToggle(member.id)}
                    >
                      {selectedMembers.includes(member.id) ? 'Remove' : 'Add'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Assign Projects ({selectedProjects.length} selected)
            </Label>
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium text-sm">{project.title}</div>
                      <div className="text-xs text-gray-500">
                        {project.type} • {project.status}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={selectedProjects.includes(project.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleProjectToggle(project.id)}
                    >
                      {selectedProjects.includes(project.id) ? 'Remove' : 'Assign'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || !formData.manager_id}>
              Create Team
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
