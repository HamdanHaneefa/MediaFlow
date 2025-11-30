import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  teamAPI,
  type User as TeamUser,
  type CreateUserData,
  type UpdateUserData,
  type UpdatePasswordData,
  type SetPermissionsData,
  type Permission,
  type TeamStats,
  type Team,
  type CreateTeamData,
  type UpdateTeamData
} from '@/services/api';
import { ProjectAssignment } from '@/types';

interface TeamContextType {
  teamMembers: TeamUser[];
  teams: Team[];
  projectAssignments: ProjectAssignment[];
  loading: boolean;
  teamsLoading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; totalPages: number };
  fetchTeamMembers: (params?: { page?: number; limit?: number; search?: string; role?: string; department?: string; is_active?: boolean }) => Promise<void>;
  searchTeamMembers: (query: string) => Promise<void>;
  createTeamMember: (data: CreateUserData) => Promise<TeamUser | null>;
  updateTeamMember: (id: string, data: UpdateUserData) => Promise<TeamUser | null>;
  deleteTeamMember: (id: string) => Promise<boolean>;
  getTeamMemberById: (id: string) => TeamUser | undefined;
  updateAvatar: (userId: string, file: File) => Promise<TeamUser | null>;
  updatePassword: (userId: string, data: UpdatePasswordData) => Promise<boolean>;
  getPermissions: (userId: string) => Promise<Permission[] | null>;
  setPermissions: (userId: string, permissions: SetPermissionsData[]) => Promise<Permission[] | null>;
  getTeamStats: () => Promise<TeamStats | null>;
  getActiveMembers: () => Promise<void>;
  // Team management methods
  fetchTeams: (params?: { page?: number; limit?: number }) => Promise<void>;
  createTeam: (data: CreateTeamData) => Promise<Team | null>;
  updateTeam: (id: string, data: UpdateTeamData) => Promise<Team | null>;
  deleteTeam: (id: string) => Promise<boolean>;
  getTeamById: (id: string) => Team | undefined;
  // Project assignment methods
  assignToProject: (assignment: Omit<ProjectAssignment, 'id'>) => Promise<ProjectAssignment | null>;
  removeFromProject: (assignmentId: string) => Promise<boolean>;
  fetchProjectAssignments: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<TeamUser[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchTeamMembers = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
    is_active?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamAPI.getAll(params);
      setTeamMembers(response.items as TeamUser[]);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on state

  const searchTeamMembers = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamAPI.search(query, { page: 1, limit: 50 });
      setTeamMembers(response.items as TeamUser[]);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search team members');
      console.error('Error searching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTeamMember = async (data: CreateUserData): Promise<TeamUser | null> => {
    try {
      setError(null);
      const newMember = await teamAPI.create(data) as TeamUser;
      setTeamMembers((prev) => [newMember, ...prev]);
      return newMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team member');
      console.error('Error creating team member:', err);
      return null;
    }
  };

  const updateTeamMember = async (
    id: string,
    data: UpdateUserData
  ): Promise<TeamUser | null> => {
    try {
      setError(null);
      const updatedMember = await teamAPI.update(id, data) as TeamUser;
      setTeamMembers((prev) => prev.map((m) => (m.id === id ? updatedMember : m)));
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team member');
      console.error('Error updating team member:', err);
      return null;
    }
  };

  const deleteTeamMember = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await teamAPI.delete(id);
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team member');
      console.error('Error deleting team member:', err);
      return false;
    }
  };

  const getTeamMemberById = (id: string): TeamUser | undefined => {
    return teamMembers.find((m) => m.id === id);
  };

  const updateAvatar = async (userId: string, file: File): Promise<TeamUser | null> => {
    try {
      setError(null);
      const updatedMember = await teamAPI.updateAvatar(userId, file) as TeamUser;
      setTeamMembers((prev) => prev.map((m) => (m.id === userId ? updatedMember : m)));
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
      console.error('Error updating avatar:', err);
      return null;
    }
  };

  const updatePassword = async (
    userId: string,
    data: UpdatePasswordData
  ): Promise<boolean> => {
    try {
      setError(null);
      await teamAPI.updatePassword(userId, data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      console.error('Error updating password:', err);
      return false;
    }
  };

  const getPermissions = async (userId: string): Promise<Permission[] | null> => {
    try {
      setError(null);
      const permissions = await teamAPI.getPermissions(userId);
      return permissions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get permissions');
      console.error('Error getting permissions:', err);
      return null;
    }
  };

  const setPermissions = async (
    userId: string,
    permissions: SetPermissionsData[]
  ): Promise<Permission[] | null> => {
    try {
      setError(null);
      const updatedPermissions = await teamAPI.setPermissions(userId, permissions);
      return updatedPermissions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set permissions');
      console.error('Error setting permissions:', err);
      return null;
    }
  };

  const getTeamStats = async (): Promise<TeamStats | null> => {
    try {
      const stats = await teamAPI.getStats();
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get team stats');
      console.error('Error getting team stats:', err);
      return null;
    }
  };

  const getActiveMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamAPI.getActive({ page: 1, limit: 100 });
      setTeamMembers(response.items as TeamUser[]);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get active members');
      console.error('Error getting active members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Teams management methods
  const fetchTeams = useCallback(async (params?: { page?: number; limit?: number }) => {
    try {
      setTeamsLoading(true);
      setError(null);
      const response = await teamAPI.getAllTeams(params);
      setTeams(response.items as Team[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      console.error('Error fetching teams:', err);
    } finally {
      setTeamsLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on state

  const createTeam = async (data: CreateTeamData): Promise<Team | null> => {
    try {
      setError(null);
      const newTeam = await teamAPI.createTeam(data) as Team;
      setTeams((prev) => [newTeam, ...prev]);
      return newTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      console.error('Error creating team:', err);
      return null;
    }
  };

  const updateTeam = async (id: string, data: UpdateTeamData): Promise<Team | null> => {
    try {
      setError(null);
      const updatedTeam = await teamAPI.updateTeam(id, data) as Team;
      setTeams((prev) => prev.map((t) => (t.id === id ? updatedTeam : t)));
      return updatedTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
      console.error('Error updating team:', err);
      return null;
    }
  };

  const deleteTeam = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await teamAPI.deleteTeam(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
      console.error('Error deleting team:', err);
      return false;
    }
  };

  const getTeamById = (id: string): Team | undefined => {
    return teams.find((t) => t.id === id);
  };

  // Project assignment methods
  const fetchProjectAssignments = useCallback(async () => {
    try {
      setError(null);
      console.log('TeamContext - Fetching project assignments from database...');
      
      // Fetch all project assignments using the team API
      const assignments = await teamAPI.getAllProjectAssignments();
      console.log('TeamContext - Raw assignments from API:', assignments);
      setProjectAssignments(assignments);
      console.log('TeamContext - Set project assignments state:', assignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project assignments');
      console.error('TeamContext - Error fetching project assignments:', err);
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

  const assignToProject = async (assignment: Omit<ProjectAssignment, 'id'>): Promise<ProjectAssignment | null> => {
    try {
      setError(null);
      console.log('Saving assignment to database:', assignment);
      
      // Use the actual team API to assign member to project
      const assignmentResponse = await teamAPI.assignToProject({
        project_id: assignment.project_id,
        team_member_id: assignment.team_member_id,
        role_in_project: assignment.role_in_project,
        is_lead: assignment.is_lead,
        responsibilities: assignment.responsibilities,
        hourly_rate_override: assignment.hourly_rate_override,
      });
      
      console.log('Database response:', assignmentResponse);
      
      // Convert the API response to our ProjectAssignment format
      const newAssignment: ProjectAssignment = {
        id: assignmentResponse.id,
        project_id: assignmentResponse.project_id,
        team_member_id: assignmentResponse.team_member_id,
        role_in_project: assignmentResponse.role_in_project,
        assigned_at: assignmentResponse.assigned_at,
        assigned_by: assignment.assigned_by,
        is_lead: assignmentResponse.is_lead,
        responsibilities: assignmentResponse.responsibilities,
        hourly_rate_override: assignmentResponse.hourly_rate_override,
      };
      
      // Update local state
      setProjectAssignments(prev => [...prev, newAssignment]);
      console.log('Assignment saved to database successfully:', newAssignment);
      
      return newAssignment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign member to project');
      console.error('Error assigning member to project:', err);
      return null;
    }
  };

  const removeFromProject = async (assignmentId: string): Promise<boolean> => {
    try {
      setError(null);
      console.log('Removing assignment from database:', assignmentId);
      
      // Use the actual team API to remove assignment
      await teamAPI.removeAssignment(assignmentId);
      
      // Update local state
      setProjectAssignments(prev => prev.filter(a => a.id !== assignmentId));
      console.log('Assignment removed from database successfully:', assignmentId);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member from project');
      console.error('Error removing member from project:', err);
      return false;
    }
  };

  useEffect(() => {
    console.log('TeamContext useEffect triggered - fetching initial data...');
    fetchTeamMembers();
    fetchTeams();
    fetchProjectAssignments();
  }, [fetchTeamMembers, fetchTeams, fetchProjectAssignments]); // All functions are now memoized

  return (
    <TeamContext.Provider
      value={{
        teamMembers,
        teams,
        projectAssignments,
        loading,
        teamsLoading,
        error,
        pagination,
        fetchTeamMembers,
        searchTeamMembers,
        createTeamMember,
        updateTeamMember,
        deleteTeamMember,
        getTeamMemberById,
        updateAvatar,
        updatePassword,
        getPermissions,
        setPermissions,
        getTeamStats,
        getActiveMembers,
        // Teams management
        fetchTeams,
        createTeam,
        updateTeam,
        deleteTeam,
        getTeamById,
        // Project assignments
        assignToProject,
        removeFromProject,
        fetchProjectAssignments,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
