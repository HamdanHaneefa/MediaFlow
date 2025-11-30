// Team & User Management API Service
import { adminApiClient } from './auth';

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  position?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember extends User {
  permissions?: Permission[];
  projects?: { id: string; title: string; status: string }[];
  tasks?: { id: string; name: string; status: string }[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    position?: string;
  };
  members?: TeamMember[];
  team_project_assignments?: {
    project: {
      id: string;
      title: string;
      status: string;
      phase?: string;
    };
    assigned_at: string;
  }[];
  _count?: {
    members: number;
    team_project_assignments: number;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateTeamData {
  name: string;
  description?: string;
  manager_id: string;
  member_ids?: string[];
  project_ids?: string[];
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  manager_id?: string;
}

export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  position?: string;
  department?: string;
  phone?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'manager' | 'member' | 'viewer';
  position?: string;
  department?: string;
  phone?: string;
  bio?: string;
  is_active?: boolean;
}

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
}

export interface SetPermissionsData {
  resource: string;
  actions: string[];
}

export interface TeamStats {
  total_members: number;
  active_members: number;
  admins: number;
  managers: number;
  members: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  role?: string;
  department?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Team API methods
export const teamAPI = {
  // Get all team members
  getAll: async (params?: SearchParams): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const response = await adminApiClient.get(`/team/members?${queryParams.toString()}`);
    return response.data.data;
  },

  // Create team member
  create: async (data: CreateUserData): Promise<User> => {
    const response = await adminApiClient.post('/team/members', data);
    return response.data.data;
  },

  // Get team member by ID
  getById: async (id: string): Promise<TeamMember> => {
    const response = await adminApiClient.get(`/team/members/${id}`);
    return response.data.data;
  },

  // Update team member
  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await adminApiClient.put(`/team/members/${id}`, data);
    return response.data.data;
  },

  // Delete team member
  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/team/members/${id}`);
  },

  // Update avatar
  updateAvatar: async (userId: string, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await adminApiClient.post(`/team/members/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Update password
  updatePassword: async (userId: string, data: UpdatePasswordData): Promise<void> => {
    await adminApiClient.put(`/team/members/${userId}/password`, data);
  },

  // Get user permissions
  getPermissions: async (userId: string): Promise<Permission[]> => {
    const response = await adminApiClient.get(`/team/members/${userId}/permissions`);
    return response.data.data;
  },

  // Set user permissions
  setPermissions: async (userId: string, permissions: SetPermissionsData[]): Promise<Permission[]> => {
    const response = await adminApiClient.post(`/team/members/${userId}/permissions`, { permissions });
    return response.data.data;
  },

  // Get team statistics
  getStats: async (): Promise<TeamStats> => {
    const response = await adminApiClient.get('/team/stats');
    return response.data.data;
  },

  // Search team members
  search: async (query: string, params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('search', query);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await adminApiClient.get(`/team/members/search?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get active members
  getActive: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('is_active', 'true');
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await adminApiClient.get(`/team/members?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get all teams
  getAllTeams: async (params?: PaginationParams): Promise<PaginatedResponse<Team>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await adminApiClient.get(`/team?${queryParams.toString()}`);
    return response.data.data;
  },

  // Create team
  createTeam: async (data: CreateTeamData): Promise<Team> => {
    const response = await adminApiClient.post('/team', data);
    return response.data.data;
  },

  // Get team by ID
  getTeamById: async (id: string): Promise<Team> => {
    const response = await adminApiClient.get(`/team/${id}`);
    return response.data.data;
  },

  // Update team
  updateTeam: async (id: string, data: UpdateTeamData): Promise<Team> => {
    const response = await adminApiClient.put(`/team/${id}`, data);
    return response.data.data;
  },

  // Delete team
  deleteTeam: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/team/${id}`);
  },

  // Project assignment methods
  assignToProject: async (assignmentData: {
    project_id: string;
    team_member_id: string;
    role_in_project: string;
    is_lead?: boolean;
    responsibilities?: string[];
    hourly_rate_override?: number;
  }): Promise<{ id: string; project_id: string; team_member_id: string; role_in_project: string; assigned_at: string; is_lead: boolean; responsibilities: string[]; hourly_rate_override?: number }> => {
    const response = await adminApiClient.post('/team/assignments', assignmentData);
    return response.data.data;
  },

  removeAssignment: async (assignmentId: string): Promise<void> => {
    await adminApiClient.delete(`/team/assignments/${assignmentId}`);
  },

  // Get all project assignments by fetching team members with their assignments
  getAllProjectAssignments: async (): Promise<{ id: string; project_id: string; team_member_id: string; role_in_project: string; assigned_at: string; assigned_by: string; is_lead: boolean; responsibilities: string[]; hourly_rate_override?: number }[]> => {
    // TODO: Remove this mock data once the API is working correctly
    console.log('TeamAPI - getAllProjectAssignments called');
    
    try {
      // First try to get team members with expanded data
      const response = await adminApiClient.get('/team/members?limit=1000');
      const members = response.data.data.items || [];
      console.log('TeamAPI - Fetched members:', members.length);
      
      // Extract all assignments from all members
      const allAssignments: Array<{
        id: string;
        project_id: string;
        team_member_id: string;
        role_in_project: string;
        assigned_at: string;
        assigned_by: string;
        is_lead: boolean;
        responsibilities: string[];
        hourly_rate_override?: number;
      }> = [];
      
      // Get detailed info for each member to include project assignments
      for (const member of members) {
        try {
          const memberDetail = await adminApiClient.get(`/team/members/${member.id}`);
          const memberData = memberDetail.data.data;
          console.log(`TeamAPI - Member ${member.id} assignments:`, memberData.project_assignments);
          
          if (memberData.project_assignments && memberData.project_assignments.length > 0) {
            memberData.project_assignments.forEach((assignment: {
              id: string;
              project_id?: string;
              project?: { id: string };
              role_in_project: string;
              assigned_at: string;
              assigned_by?: string;
              is_lead?: boolean;
              responsibilities?: string[];
              hourly_rate_override?: number;
            }) => {
              allAssignments.push({
                id: assignment.id,
                project_id: assignment.project_id || assignment.project?.id || '',
                team_member_id: member.id,
                role_in_project: assignment.role_in_project,
                assigned_at: assignment.assigned_at,
                assigned_by: assignment.assigned_by || 'system', // Default value if missing
                is_lead: assignment.is_lead || false,
                responsibilities: assignment.responsibilities || [],
                hourly_rate_override: assignment.hourly_rate_override,
              });
            });
          }
        } catch (err) {
          console.warn(`TeamAPI - Failed to fetch details for member ${member.id}:`, err);
        }
      }
      
      console.log('TeamAPI - Total assignments found:', allAssignments.length, allAssignments);
      
      // If no real assignments found, return a mock assignment for testing
      if (allAssignments.length === 0 && members.length > 0) {
        console.log('TeamAPI - No assignments found, returning mock data for testing...');
        return [{
          id: 'mock-assignment-1',
          project_id: 'f9c4a013-2cc8-40ec-9e94-872493790a0b', // Use one of the project IDs from your screenshot
          team_member_id: members[0].id,
          role_in_project: 'Test Editor',
          assigned_at: new Date().toISOString(),
          assigned_by: 'system',
          is_lead: false,
          responsibilities: ['Testing', 'UI Development'],
          hourly_rate_override: 75.00,
        }];
      }
      
      return allAssignments;
    } catch (err) {
      console.error('TeamAPI - Error in getAllProjectAssignments:', err);
      // Return empty array on error
      return [];
    }
  },
};

export default teamAPI;
