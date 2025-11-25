import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamRole, TeamMemberStatus } from '@/types';
import { useTeam } from '@/contexts/TeamContext';
import { X } from 'lucide-react';

interface TeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  editingMemberId?: string | null;
}

const teamRoles: TeamRole[] = [
  'Owner', 'Manager', 'Producer', 'Director', 'Editor', 
  'Camera Operator', 'Audio Engineer', 'Assistant', 'Freelancer'
];

const statusOptions: TeamMemberStatus[] = ['Active', 'Inactive', 'On Leave', 'Terminated'];

export function TeamMemberDialog({ open, onClose, editingMemberId }: TeamMemberDialogProps) {
  const { state, addTeamMember, updateTeamMember } = useTeam();
  
  const editingMember = editingMemberId 
    ? state.teamMembers.find(m => m.id === editingMemberId)
    : null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    role: 'Assistant' as TeamRole,
    status: 'Active' as TeamMemberStatus,
    hourly_rate: '',
    bio: '',
    skills: [] as string[],
    permissions: {
      can_manage_projects: false,
      can_send_proposals: false,
      can_approve_expenses: false,
      can_manage_team: false,
      can_view_financials: false,
      can_manage_assets: false,
      can_access_client_portal: false,
    },
    emergency_contact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name,
        email: editingMember.email,
        phone: editingMember.phone || '',
        avatar_url: editingMember.avatar_url || '',
        role: editingMember.role,
        status: editingMember.status,
        hourly_rate: editingMember.hourly_rate?.toString() || '',
        bio: editingMember.bio || '',
        skills: editingMember.skills || [],
        permissions: editingMember.permissions,
        emergency_contact: editingMember.emergency_contact || {
          name: '',
          phone: '',
          relationship: '',
        },
      });
    } else {
      // Reset form for new member
      setFormData({
        name: '',
        email: '',
        phone: '',
        avatar_url: '',
        role: 'Assistant',
        status: 'Active',
        hourly_rate: '',
        bio: '',
        skills: [],
        permissions: {
          can_manage_projects: false,
          can_send_proposals: false,
          can_approve_expenses: false,
          can_manage_team: false,
          can_view_financials: false,
          can_manage_assets: false,
          can_access_client_portal: false,
        },
        emergency_contact: {
          name: '',
          phone: '',
          relationship: '',
        },
      });
    }
  }, [editingMember, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      avatar_url: formData.avatar_url || undefined,
      role: formData.role,
      status: formData.status,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
      bio: formData.bio || undefined,
      skills: formData.skills,
      permissions: formData.permissions,
      emergency_contact: formData.emergency_contact.name ? formData.emergency_contact : undefined,
      hire_date: editingMember?.hire_date || new Date().toISOString(),
      assigned_projects: editingMember?.assigned_projects || [],
      performance_metrics: editingMember?.performance_metrics,
    };

    if (editingMember) {
      updateTeamMember(editingMember.id, memberData);
    } else {
      addTeamMember(memberData);
    }

    onClose();
  };

  const handlePermissionChange = (permission: keyof typeof formData.permissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
          </DialogTitle>
          <DialogDescription>
            {editingMember 
              ? 'Update team member information and permissions.'
              : 'Add a new team member to your organization.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: TeamRole) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: TeamMemberStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief description of the team member..."
                rows={3}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Skills</h3>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(formData.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-sm font-normal">
                    {key.replace(/can_|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={() => handlePermissionChange(key as keyof typeof formData.permissions)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Emergency Contact (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_name">Contact Name</Label>
                <Input
                  id="emergency_name"
                  value={formData.emergency_contact.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergency_contact: { ...prev.emergency_contact, name: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="emergency_phone">Contact Phone</Label>
                <Input
                  id="emergency_phone"
                  value={formData.emergency_contact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergency_contact: { ...prev.emergency_contact, phone: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emergency_relationship">Relationship</Label>
              <Input
                id="emergency_relationship"
                value={formData.emergency_contact.relationship}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emergency_contact: { ...prev.emergency_contact, relationship: e.target.value }
                }))}
                placeholder="Spouse, Parent, Sibling, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingMember ? 'Update Member' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
