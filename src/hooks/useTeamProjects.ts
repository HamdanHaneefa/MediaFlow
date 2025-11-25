import { useTeam } from '@/contexts/TeamContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { Project } from '@/types';

export function useTeamProjects(currentUserId?: string) {
  const { state } = useTeam();
  const { projects } = useProjects();

  // Get projects accessible to the current user based on team membership
  const getAccessibleProjects = (): Project[] => {
    if (!currentUserId) {
      // If no user ID provided, return all projects (for admin view)
      return projects;
    }

    const currentMember = state.teamMembers.find(member => member.id === currentUserId);
    
    if (!currentMember) {
      return [];
    }

    // If user can manage projects, they can see all projects
    if (currentMember.permissions.can_manage_projects) {
      return projects;
    }

    // Get user's team(s)
    const userTeams = state.teams.filter(team => 
      team.member_ids.includes(currentUserId)
    );

    // Get all project IDs accessible to user's teams
    const accessibleProjectIds = new Set<string>();
    
    userTeams.forEach(team => {
      team.project_ids.forEach(projectId => {
        accessibleProjectIds.add(projectId);
      });
    });

    // Also include projects directly assigned to the user (legacy assignments)
    currentMember.assigned_projects.forEach(projectId => {
      accessibleProjectIds.add(projectId);
    });

    // Filter projects based on accessible project IDs
    return projects.filter(project => accessibleProjectIds.has(project.id));
  };

  // Check if user has access to a specific project
  const hasProjectAccess = (projectId: string): boolean => {
    const accessibleProjects = getAccessibleProjects();
    return accessibleProjects.some(project => project.id === projectId);
  };

  // Get teams that have access to a specific project
  const getTeamsWithProjectAccess = (projectId: string) => {
    return state.teams.filter(team => team.project_ids.includes(projectId));
  };

  // Get team members who have access to a specific project
  const getMembersWithProjectAccess = (projectId: string) => {
    const teamsWithAccess = getTeamsWithProjectAccess(projectId);
    const memberIds = new Set<string>();

    teamsWithAccess.forEach(team => {
      team.member_ids.forEach(memberId => {
        memberIds.add(memberId);
      });
    });

    // Also include members with direct project assignments
    state.projectAssignments
      .filter(assignment => assignment.project_id === projectId)
      .forEach(assignment => {
        memberIds.add(assignment.team_member_id);
      });

    return state.teamMembers.filter(member => memberIds.has(member.id));
  };

  return {
    accessibleProjects: getAccessibleProjects(),
    hasProjectAccess,
    getTeamsWithProjectAccess,
    getMembersWithProjectAccess,
  };
}
