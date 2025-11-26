// File Upload Management API Service
import { adminApiClient } from './auth';

// Types
export interface UploadedFile {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: 'avatar' | 'document' | 'image' | 'video' | 'receipt' | 'other';
  uploaded_by: string;
  uploaded_at: string;
  project_id?: string;
  task_id?: string;
  invoice_id?: string;
}

export interface UploadResponse {
  file: UploadedFile;
  url: string;
}

export interface FileCategory {
  category: 'avatar' | 'document' | 'image' | 'video' | 'receipt' | 'other';
  allowed_types: string[];
  max_size: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FileSearchParams extends PaginationParams {
  search?: string;
  category?: 'avatar' | 'document' | 'image' | 'video' | 'receipt' | 'other';
  project_id?: string;
  task_id?: string;
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

// Upload API methods
export const uploadsAPI = {
  // Upload file
  upload: async (
    file: File,
    category: 'avatar' | 'document' | 'image' | 'video' | 'receipt' | 'other',
    metadata?: {
      project_id?: string;
      task_id?: string;
      invoice_id?: string;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    if (metadata?.project_id) formData.append('project_id', metadata.project_id);
    if (metadata?.task_id) formData.append('task_id', metadata.task_id);
    if (metadata?.invoice_id) formData.append('invoice_id', metadata.invoice_id);

    const response = await adminApiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        }
      },
    });
    return response.data.data;
  },

  // Upload multiple files
  uploadMultiple: async (
    files: File[],
    category: 'avatar' | 'document' | 'image' | 'video' | 'receipt' | 'other',
    metadata?: {
      project_id?: string;
      task_id?: string;
      invoice_id?: string;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse[]> => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('category', category);
    if (metadata?.project_id) formData.append('project_id', metadata.project_id);
    if (metadata?.task_id) formData.append('task_id', metadata.task_id);
    if (metadata?.invoice_id) formData.append('invoice_id', metadata.invoice_id);

    const response = await adminApiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        }
      },
    });
    return response.data.data;
  },

  // Get all files
  getAll: async (params?: FileSearchParams): Promise<PaginatedResponse<UploadedFile>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.project_id) queryParams.append('project_id', params.project_id);
    if (params?.task_id) queryParams.append('task_id', params.task_id);

    const response = await adminApiClient.get(`/upload?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get file by ID
  getById: async (id: string): Promise<UploadedFile> => {
    const response = await adminApiClient.get(`/upload/${id}`);
    return response.data.data;
  },

  // Delete file
  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/upload/${id}`);
  },

  // Get file URL
  getFileUrl: (filePath: string): string => {
    return `${adminApiClient.defaults.baseURL?.replace('/api', '')}/uploads/${filePath}`;
  },

  // Download file
  download: async (id: string): Promise<Blob> => {
    const response = await adminApiClient.get(`/upload/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get file categories and limits
  getCategories: async (): Promise<FileCategory[]> => {
    const response = await adminApiClient.get('/upload/categories');
    return response.data.data;
  },

  // Helper methods for common upload scenarios
  uploadAvatar: async (file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadResponse> => {
    return uploadsAPI.upload(file, 'avatar', undefined, onProgress);
  },

  uploadDocument: async (
    file: File,
    projectId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> => {
    return uploadsAPI.upload(file, 'document', { project_id: projectId }, onProgress);
  },

  uploadImage: async (
    file: File,
    projectId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> => {
    return uploadsAPI.upload(file, 'image', { project_id: projectId }, onProgress);
  },

  uploadReceipt: async (
    file: File,
    expenseId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> => {
    return uploadsAPI.upload(file, 'receipt', { invoice_id: expenseId }, onProgress);
  },

  uploadTaskAttachment: async (
    file: File,
    taskId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> => {
    return uploadsAPI.upload(file, 'document', { task_id: taskId }, onProgress);
  },
};

export default uploadsAPI;
