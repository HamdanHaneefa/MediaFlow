import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  teamAPI,
  type User as TeamUser,
  type CreateUserData,
  type UpdateUserData,
  type UpdatePasswordData,
  type SetPermissionsData,
  type Permission,
  type TeamStats
} from '@/services/api';

interface TeamContextType {
  teamMembers: TeamUser[];
  loading: boolean;
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
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchTeamMembers = async (params?: {
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
  };

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

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return (
    <TeamContext.Provider
      value={{
        teamMembers,
        loading,
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
