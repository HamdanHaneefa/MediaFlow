// Projects Management API Service
import { adminApiClient } from './auth';

// Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  contact_id: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  start_date: string;
  end_date?: string;
  deadline?: string;
  budget?: number;
  actual_cost?: number;
  progress: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    company?: string;
  };
  team_members?: ProjectMember[];
  tasks?: Task[];
  files?: ProjectFile[];
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  added_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  contact_id: string;
  status?: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  start_date: string;
  end_date?: string;
  deadline?: string;
  budget?: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  progress?: number;
  actual_cost?: number;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  due_date: string;
  status: 'Pending' | 'Completed';
  created_at: string;
}

export interface CreateMilestoneData {
  name: string;
  description?: string;
  due_date: string;
}

export interface ProjectBudgetData {
  budget: number;
  actual_cost: number;
  notes?: string;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_budget: number;
  total_actual_cost: number;
  on_time_completion_rate: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  status?: string;
  priority?: string;
  contact_id?: string;
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

// Projects API methods
export const projectsAPI = {
  // Get all projects
  getAll: async (params?: SearchParams): Promise<PaginatedResponse<Project>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.contact_id) queryParams.append('contact_id', params.contact_id);

    const response = await adminApiClient.get(`/projects?${queryParams.toString()}`);
    return response.data.data;
  },

  // Create project
  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await adminApiClient.post('/projects', data);
    return response.data.data;
  },

  // Get project by ID
  getById: async (id: string): Promise<Project> => {
    const response = await adminApiClient.get(`/projects/${id}`);
    return response.data.data;
  },

  // Update project
  update: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await adminApiClient.put(`/projects/${id}`, data);
    return response.data.data;
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/projects/${id}`);
  },

  // Update project status
  updateStatus: async (id: string, status: Project['status']): Promise<Project> => {
    const response = await adminApiClient.put(`/projects/${id}/status`, { status });
    return response.data.data;
  },

  // Add team member to project
  addMember: async (projectId: string, userId: string, role: string): Promise<ProjectMember> => {
    const response = await adminApiClient.post(`/projects/${projectId}/members`, {
      user_id: userId,
      role,
    });
    return response.data.data;
  },

  // Remove team member from project
  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await adminApiClient.delete(`/projects/${projectId}/members/${userId}`);
  },

  // Add milestone
  addMilestone: async (projectId: string, data: CreateMilestoneData): Promise<ProjectMilestone> => {
    const response = await adminApiClient.post(`/projects/${projectId}/milestones`, data);
    return response.data.data;
  },

  // Get project tasks
  getTasks: async (projectId: string): Promise<Task[]> => {
    const response = await adminApiClient.get(`/projects/${projectId}/tasks`);
    return response.data.data;
  },

  // Get project files
  getFiles: async (projectId: string): Promise<ProjectFile[]> => {
    const response = await adminApiClient.get(`/projects/${projectId}/files`);
    return response.data.data;
  },

  // Update project budget
  updateBudget: async (projectId: string, data: ProjectBudgetData): Promise<Project> => {
    const response = await adminApiClient.post(`/projects/${projectId}/budget`, data);
    return response.data.data;
  },

  // Get project statistics
  getStats: async (): Promise<ProjectStats> => {
    const response = await adminApiClient.get('/projects/stats');
    return response.data.data;
  },

  // Search projects
  search: async (query: string, params?: PaginationParams): Promise<PaginatedResponse<Project>> => {
    const queryParams = new URLSearchParams({ search: query });
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await adminApiClient.get(`/projects/search?${queryParams.toString()}`);
    return response.data.data;
  },

  // Bulk update projects
  bulkUpdate: async (projectIds: string[], data: UpdateProjectData): Promise<{ updated: number }> => {
    const response = await adminApiClient.post('/projects/bulk-update', {
      ids: projectIds,
      data,
    });
    return response.data.data;
  },
};

export default projectsAPI;
