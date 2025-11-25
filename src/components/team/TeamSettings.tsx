import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Mail,
  Clock
} from 'lucide-react';

export function TeamSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    teamName: 'MediaFlow Production Team',
    teamDescription: 'A creative production team specializing in commercial and documentary content.',
    timezone: 'America/New_York',
    workingHours: {
      start: '09:00',
      end: '17:00',
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    
    // Invitation Settings
    defaultInvitationExpiry: '7',
    allowSelfRegistration: false,
    requireManagerApproval: true,
    defaultPermissions: {
      can_manage_projects: false,
      can_send_proposals: false,
      can_approve_expenses: false,
      can_manage_team: false,
      can_view_financials: false,
      can_manage_assets: false,
      can_access_client_portal: false,
    },
    
    // Notification Settings
    emailNotifications: {
      newTeamMember: true,
      projectAssignments: true,
      statusUpdates: true,
      performanceReports: false,
    },
    
    // Performance Settings
    trackPerformanceMetrics: true,
    performanceReviewCycle: '90', // days
    autoGenerateReports: true,
    
    // Security Settings
    enforceStrongPasswords: true,
    sessionTimeout: '480', // minutes
    twoFactorAuth: false,
    ipWhitelist: '',
    
    // Integration Settings
    slackIntegration: false,
    slackWebhook: '',
    emailProvider: 'system',
    customEmailTemplates: false,
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving team settings:', settings);
    // Show success message
  };

  const handleReset = () => {
    // Reset to default values
    console.log('Resetting team settings');
  };

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Denver',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Australia/Sydney',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Team Settings</h3>
        <p className="text-sm text-gray-500">Configure team preferences and policies</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={settings.teamName}
                  onChange={(e) => setSettings(prev => ({ ...prev, teamName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="teamDescription">Team Description</Label>
              <Textarea
                id="teamDescription"
                value={settings.teamDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, teamDescription: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label>Working Hours</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="workStart" className="text-sm">Start Time</Label>
                  <Input
                    id="workStart"
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="workEnd" className="text-sm">End Time</Label>
                  <Input
                    id="workEnd"
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Self Registration</Label>
                <p className="text-sm text-gray-500">Allow people to join the team without invitation</p>
              </div>
              <Switch
                checked={settings.allowSelfRegistration}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowSelfRegistration: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Manager Approval</Label>
                <p className="text-sm text-gray-500">New members need approval before accessing</p>
              </div>
              <Switch
                checked={settings.requireManagerApproval}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireManagerApproval: checked }))}
              />
            </div>

            <div>
              <Label htmlFor="invitationExpiry">Default Invitation Expiry</Label>
              <Select 
                value={settings.defaultInvitationExpiry} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, defaultInvitationExpiry: value }))}
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
          </CardContent>
        </Card>

        {/* Permissions & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enforce Strong Passwords</Label>
                <p className="text-sm text-gray-500">Require complex passwords for all team members</p>
              </div>
              <Switch
                checked={settings.enforceStrongPasswords}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enforceStrongPasswords: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Require 2FA for sensitive operations</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select 
                  value={settings.sessionTimeout} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, sessionTimeout: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 Hour</SelectItem>
                    <SelectItem value="240">4 Hours</SelectItem>
                    <SelectItem value="480">8 Hours</SelectItem>
                    <SelectItem value="720">12 Hours</SelectItem>
                    <SelectItem value="1440">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="ipWhitelist">IP Whitelist (Optional)</Label>
                <Input
                  id="ipWhitelist"
                  value={settings.ipWhitelist}
                  onChange={(e) => setSettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                  placeholder="192.168.1.0/24, 10.0.0.0/8"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>New Team Member Notifications</Label>
                <p className="text-sm text-gray-500">Notify managers when new members join</p>
              </div>
              <Switch
                checked={settings.emailNotifications.newTeamMember}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  emailNotifications: { ...prev.emailNotifications, newTeamMember: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Project Assignment Notifications</Label>
                <p className="text-sm text-gray-500">Notify members when assigned to projects</p>
              </div>
              <Switch
                checked={settings.emailNotifications.projectAssignments}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  emailNotifications: { ...prev.emailNotifications, projectAssignments: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Status Update Notifications</Label>
                <p className="text-sm text-gray-500">Notify team about project status changes</p>
              </div>
              <Switch
                checked={settings.emailNotifications.statusUpdates}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  emailNotifications: { ...prev.emailNotifications, statusUpdates: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Track Performance Metrics</Label>
                <p className="text-sm text-gray-500">Monitor team member performance and productivity</p>
              </div>
              <Switch
                checked={settings.trackPerformanceMetrics}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, trackPerformanceMetrics: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Generate Reports</Label>
                <p className="text-sm text-gray-500">Automatically create performance reports</p>
              </div>
              <Switch
                checked={settings.autoGenerateReports}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoGenerateReports: checked }))}
              />
            </div>

            <div>
              <Label htmlFor="reviewCycle">Performance Review Cycle</Label>
              <Select 
                value={settings.performanceReviewCycle} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, performanceReviewCycle: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Monthly</SelectItem>
                  <SelectItem value="90">Quarterly</SelectItem>
                  <SelectItem value="180">Bi-Annual</SelectItem>
                  <SelectItem value="365">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Slack Integration</Label>
                <p className="text-sm text-gray-500">Send notifications to Slack channels</p>
              </div>
              <Switch
                checked={settings.slackIntegration}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, slackIntegration: checked }))}
              />
            </div>

            {settings.slackIntegration && (
              <div>
                <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                <Input
                  id="slackWebhook"
                  value={settings.slackWebhook}
                  onChange={(e) => setSettings(prev => ({ ...prev, slackWebhook: e.target.value }))}
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
            )}

            <div>
              <Label htmlFor="emailProvider">Email Provider</Label>
              <Select 
                value={settings.emailProvider} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, emailProvider: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Default</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                  <SelectItem value="ses">Amazon SES</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Custom Email Templates</Label>
                <p className="text-sm text-gray-500">Use custom branding for email notifications</p>
              </div>
              <Switch
                checked={settings.customEmailTemplates}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, customEmailTemplates: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
