import { useTeam } from '@/contexts/TeamContext';
import { useProjects } from '@/contexts/ProjectsContext';

export function useTeamProjects(currentUserId?: string) {
  const { teamMembers } = useTeam();
  const { projects } = useProjects();

  // Get projects accessible to the current user based on team membership
  const getAccessibleProjects = () => {
    // For now, return all projects since role-based access is not implemented yet
    // This allows all authenticated users to see all projects
    return projects;
  };

  // Check if user has access to a specific project
  const hasProjectAccess = (projectId: string): boolean => {
    const accessibleProjects = getAccessibleProjects();
    return accessibleProjects.some(project => project.id === projectId);
  };

  // Get teams that have access to a specific project
  const getTeamsWithProjectAccess = (_projectId: string) => {
    // TODO: Implement when teams are added to context
    return [];
  };

  // Get team members who have access to a specific project
  const getMembersWithProjectAccess = (_projectId: string) => {
    // TODO: Implement when project assignments are added to context
    return teamMembers;
  };

  return {
    accessibleProjects: getAccessibleProjects(),
    hasProjectAccess,
    getTeamsWithProjectAccess,
    getMembersWithProjectAccess,
  };
}
