// Tasks Management API Service
import { adminApiClient } from './auth';

// Types
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskType = 'Creative' | 'Technical' | 'Administrative';

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  assigned_to?: string;
  created_by: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done' | 'Blocked';
  priority: TaskPriority;
  type?: TaskType;
  due_date?: string;
  start_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  dependencies?: string[];
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  };
  assigned_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  project_id?: string;
  assigned_to?: string;
  status?: 'To Do' | 'In Progress' | 'Review' | 'Done' | 'Blocked';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: 'Creative' | 'Technical' | 'Administrative';
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  tags?: string[];
  dependencies?: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  actual_hours?: number;
  completed_at?: string;
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  my_tasks: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  status?: string;
  priority?: string;
  project_id?: string;
  assigned_to?: string;
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

// Tasks API methods
export const tasksAPI = {
  // Get all tasks
  getAll: async (params?: SearchParams): Promise<PaginatedResponse<Task>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.project_id) queryParams.append('project_id', params.project_id);
    if (params?.assigned_to) queryParams.append('assigned_to', params.assigned_to);

    const response = await adminApiClient.get(`/tasks?${queryParams.toString()}`);
    return response.data.data;
  },

  // Create task
  create: async (data: CreateTaskData): Promise<Task> => {
    const response = await adminApiClient.post('/tasks', data);
    return response.data.data;
  },

  // Get task by ID
  getById: async (id: string): Promise<Task> => {
    const response = await adminApiClient.get(`/tasks/${id}`);
    return response.data.data;
  },

  // Update task
  update: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response = await adminApiClient.put(`/tasks/${id}`, data);
    return response.data.data;
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/tasks/${id}`);
  },

  // Update task status
  updateStatus: async (id: string, status: Task['status']): Promise<Task> => {
    const response = await adminApiClient.put(`/tasks/${id}/status`, { status });
    return response.data.data;
  },

  // Update task priority
  updatePriority: async (id: string, priority: Task['priority']): Promise<Task> => {
    const response = await adminApiClient.put(`/tasks/${id}/priority`, { priority });
    return response.data.data;
  },

  // Assign task to user
  assign: async (taskId: string, userId: string): Promise<Task> => {
    const response = await adminApiClient.post(`/tasks/${taskId}/assign`, { user_id: userId });
    return response.data.data;
  },

  // Add comment to task
  addComment: async (taskId: string, comment: string): Promise<TaskComment> => {
    const response = await adminApiClient.post(`/tasks/${taskId}/comments`, { comment });
    return response.data.data;
  },

  // Add attachment to task
  addAttachment: async (taskId: string, file: File): Promise<TaskAttachment> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await adminApiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Get my tasks
  getMyTasks: async (params?: PaginationParams): Promise<PaginatedResponse<Task>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await adminApiClient.get(`/tasks/my-tasks?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get overdue tasks
  getOverdue: async (params?: PaginationParams): Promise<PaginatedResponse<Task>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await adminApiClient.get(`/tasks/overdue?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get task statistics
  getStats: async (): Promise<TaskStats> => {
    const response = await adminApiClient.get('/tasks/stats');
    return response.data.data;
  },

  // Bulk update tasks
  bulkUpdate: async (taskIds: string[], data: UpdateTaskData): Promise<{ updated: number }> => {
    const response = await adminApiClient.post('/tasks/bulk-update', {
      ids: taskIds,
      data,
    });
    return response.data.data;
  },
};

export default tasksAPI;
