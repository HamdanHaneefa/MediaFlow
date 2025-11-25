import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamRole } from '@/types';
import { useTeam } from '@/contexts/TeamContext';
import { Mail, Calendar } from 'lucide-react';

interface TeamInvitationDialogProps {
  open: boolean;
  onClose: () => void;
}

const teamRoles: TeamRole[] = [
  'Owner', 'Manager', 'Producer', 'Director', 'Editor', 
  'Camera Operator', 'Audio Engineer', 'Assistant', 'Freelancer'
];

export function TeamInvitationDialog({ open, onClose }: TeamInvitationDialogProps) {
  const { sendInvitation } = useTeam();
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'Assistant' as TeamRole,
    message: '',
    expiryDays: '7',
    permissions: {
      can_manage_projects: false,
      can_send_proposals: false,
      can_approve_expenses: false,
      can_manage_team: false,
      can_view_financials: false,
      can_manage_assets: false,
      can_access_client_portal: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiryDays));

    const invitationData = {
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
      invited_by: 'current-user-id', // This would come from auth context
      invitation_token: `token-${Date.now()}`, // Add the required token
      expires_at: expiresAt.toISOString(),
      status: 'Pending' as const,
      message: formData.message || undefined,
    };

    sendInvitation(invitationData);
    
    // Reset form
    setFormData({
      email: '',
      role: 'Assistant',
      message: '',
      expiryDays: '7',
      permissions: {
        can_manage_projects: false,
        can_send_proposals: false,
        can_approve_expenses: false,
        can_manage_team: false,
        can_view_financials: false,
        can_manage_assets: false,
        can_access_client_portal: false,
      },
    });

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

  const setRolePresets = (role: TeamRole) => {
    setFormData(prev => ({ ...prev, role }));
    
    // Set default permissions based on role
    let permissions = {
      can_manage_projects: false,
      can_send_proposals: false,
      can_approve_expenses: false,
      can_manage_team: false,
      can_view_financials: false,
      can_manage_assets: false,
      can_access_client_portal: false,
    };

    switch (role) {
      case 'Owner':
        permissions = {
          can_manage_projects: true,
          can_send_proposals: true,
          can_approve_expenses: true,
          can_manage_team: true,
          can_view_financials: true,
          can_manage_assets: true,
          can_access_client_portal: true,
        };
        break;
      case 'Manager':
        permissions = {
          can_manage_projects: true,
          can_send_proposals: true,
          can_approve_expenses: true,
          can_manage_team: true,
          can_view_financials: true,
          can_manage_assets: true,
          can_access_client_portal: true,
        };
        break;
      case 'Producer':
        permissions = {
          can_manage_projects: true,
          can_send_proposals: true,
          can_approve_expenses: false,
          can_manage_team: false,
          can_view_financials: false,
          can_manage_assets: true,
          can_access_client_portal: true,
        };
        break;
      case 'Director':
        permissions = {
          can_manage_projects: true,
          can_send_proposals: false,
          can_approve_expenses: false,
          can_manage_team: false,
          can_view_financials: false,
          can_manage_assets: true,
          can_access_client_portal: true,
        };
        break;
      case 'Editor':
        permissions = {
          can_manage_projects: false,
          can_send_proposals: false,
          can_approve_expenses: false,
          can_manage_team: false,
          can_view_financials: false,
          can_manage_assets: true,
          can_access_client_portal: false,
        };
        break;
      default:
        // Keep default minimal permissions
        break;
    }

    setFormData(prev => ({ ...prev, permissions }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new team member to your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invitation Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="member@company.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={setRolePresets}
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
                <Label htmlFor="expiryDays">Expires In</Label>
                <Select 
                  value={formData.expiryDays} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expiryDays: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">1 Week</SelectItem>
                    <SelectItem value="14">2 Weeks</SelectItem>
                    <SelectItem value="30">1 Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Welcome to our team! We're excited to have you join us..."
                rows={3}
              />
            </div>
          </div>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Permissions</CardTitle>
              <p className="text-xs text-gray-500">
                Permissions are automatically set based on the selected role, but can be customized.
              </p>
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

          {/* Preview */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Invitation Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>To:</strong> {formData.email || 'member@company.com'}</p>
              <p><strong>Role:</strong> {formData.role}</p>
              <p><strong>Expires:</strong> {formData.expiryDays} day(s) from now</p>
              <p><strong>Permissions:</strong> {Object.values(formData.permissions).filter(Boolean).length} of {Object.keys(formData.permissions).length}</p>
              {formData.message && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-xs text-gray-600">Personal Message:</p>
                  <p className="italic">"{formData.message}"</p>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
