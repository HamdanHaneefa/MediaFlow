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
  projects?: any[];
  tasks?: any[];
}

export interface Permission {
  id: string;
  user_id: string;
  resource: string;
  actions: string[];
  created_at: string;
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
};

export default teamAPI;
