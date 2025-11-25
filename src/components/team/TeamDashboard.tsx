import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeam } from '@/contexts/TeamContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star,
  Target,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function TeamDashboard() {
  const { state } = useTeam();
  const { projects } = useProjects();
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTeamPerformanceMetrics = () => {
    const activeMembers = state.teamMembers.filter(m => m.status === 'Active');
    
    const totalTasks = activeMembers.reduce((sum, member) => 
      sum + (member.performance_metrics?.tasks_completed || 0), 0
    );
    
    const totalProjects = activeMembers.reduce((sum, member) => 
      sum + (member.performance_metrics?.projects_managed || 0), 0
    );
    
    const totalProposals = activeMembers.reduce((sum, member) => 
      sum + (member.performance_metrics?.proposals_sent || 0), 0
    );
    
    const avgRating = activeMembers.reduce((sum, member) => 
      sum + (member.performance_metrics?.client_satisfaction_rating || 0), 0
    ) / activeMembers.length;

    const avgCompletionTime = activeMembers.reduce((sum, member) => 
      sum + (member.performance_metrics?.avg_task_completion_time || 0), 0
    ) / activeMembers.length;

    return {
      totalTasks,
      totalProjects,
      totalProposals,
      avgRating: isNaN(avgRating) ? 0 : avgRating,
      avgCompletionTime: isNaN(avgCompletionTime) ? 0 : avgCompletionTime,
      activeMembers: activeMembers.length,
    };
  };

  const getTopPerformers = () => {
    return state.teamMembers
      .filter(m => m.status === 'Active' && m.performance_metrics)
      .sort((a, b) => {
        const scoreA = (a.performance_metrics?.tasks_completed || 0) * 0.3 +
                      (a.performance_metrics?.client_satisfaction_rating || 0) * 0.4 +
                      (a.performance_metrics?.projects_managed || 0) * 0.3;
        const scoreB = (b.performance_metrics?.tasks_completed || 0) * 0.3 +
                      (b.performance_metrics?.client_satisfaction_rating || 0) * 0.4 +
                      (b.performance_metrics?.projects_managed || 0) * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  };

  const getProjectDistribution = () => {
    const projectCounts: Record<string, number> = {};
    
    state.projectAssignments.forEach(assignment => {
      const project = projects.find((p) => p.id === assignment.project_id);
      if (project) {
        projectCounts[project.title] = (projectCounts[project.title] || 0) + 1;
      }
    });

    return Object.entries(projectCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getRecentActivity = () => {
    const activities: Array<{
      type: string;
      member: string;
      description: string;
      timestamp: string;
      avatar?: string;
    }> = [];

    // Simulate recent activities based on team data
    state.teamMembers
      .filter(m => m.last_active)
      .sort((a, b) => new Date(b.last_active!).getTime() - new Date(a.last_active!).getTime())
      .slice(0, 10)
      .forEach(member => {
        activities.push({
          type: 'activity',
          member: member.name,
          description: 'was active in the system',
          timestamp: member.last_active!,
          avatar: member.avatar_url,
        });
      });

    // Add recent assignments
    state.projectAssignments
      .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime())
      .slice(0, 5)
      .forEach(assignment => {
        const member = state.teamMembers.find(m => m.id === assignment.team_member_id);
        const project = projects.find((p) => p.id === assignment.project_id);
        if (member && project) {
          activities.push({
            type: 'assignment',
            member: member.name,
            description: `was assigned to ${project.title} as ${assignment.role_in_project}`,
            timestamp: assignment.assigned_at,
            avatar: member.avatar_url,
          });
        }
      });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  };

  const metrics = getTeamPerformanceMetrics();
  const topPerformers = getTopPerformers();
  const projectDistribution = getProjectDistribution();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Dashboard</h3>
          <p className="text-sm text-gray-500">Overview of team performance and activities</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Client satisfaction score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Managed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.activeMembers} team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgCompletionTime.toFixed(1)}d</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.5d</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((member, index) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 w-4">
                        #{index + 1}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {member.performance_metrics?.client_satisfaction_rating.toFixed(1)} ⭐
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.performance_metrics?.tasks_completed} tasks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectDistribution.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className="text-sm text-gray-500">{project.count} members</span>
                  </div>
                  <Progress 
                    value={(project.count / Math.max(...projectDistribution.map(p => p.count))) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
              {projectDistribution.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No project assignments yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Utilization and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.teamMembers
                .filter(m => m.status === 'Active')
                .slice(0, 6)
                .map((member) => {
                  const assignments = state.projectAssignments.filter(
                    a => a.team_member_id === member.id
                  );
                  const utilizationPercentage = Math.min((assignments.length / 3) * 100, 100);
                  
                  return (
                    <div key={member.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar_url} alt={member.name} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{member.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {assignments.length} project{assignments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Progress value={utilizationPercentage} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={activity.avatar} alt={activity.member} />
                    <AvatarFallback className="text-xs">
                      {getInitials(activity.member)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.member}</span>{' '}
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
