// Admin Authentication API Service
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
// Create axios instance for admin API
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add admin token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          // Backend returns { accessToken, refreshToken } in camelCase
          const responseData = response.data.data || response.data;
          const { accessToken, refreshToken: newRefreshToken } = responseData;
          
          localStorage.setItem('admin_access_token', accessToken);
          localStorage.setItem('admin_refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  role: 'Admin' | 'Manager' | 'Staff';
  position?: string;
  status?: 'active' | 'inactive' | 'on_leave';
  is_active: boolean;
  bio?: string;
  last_active?: string;
  performance_metrics?: {
    tasks_completed: number;
    projects_managed: number;
    proposals_sent: number;
    expenses_entered: number;
    avg_task_completion_time: number;
    client_satisfaction_rating: number;
  };
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'Admin' | 'Manager' | 'Staff';
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Admin Authentication API methods
export const authAPI = {
  // Register new admin user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    
    console.log('Register Response:', response);
    console.log('Register Data:', response.data);
    
    // Backend returns { success, data: { accessToken, refreshToken, user }, message }
    const responseData = response.data.data || response.data;
    const { accessToken, refreshToken, user } = responseData;
    
    if (!accessToken || !refreshToken) {
      throw new Error('Invalid response: missing tokens');
    }
    
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(user));
    
    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    
    console.log('Full Backend Response:', response);
    console.log('Response Data:', response.data);
    
    // Backend returns { success, data: { accessToken, refreshToken, user }, message }
    const responseData = response.data.data || response.data;
    const { accessToken, refreshToken, user } = responseData;
    
    console.log('Extracted Values:', { accessToken, refreshToken, user });
    
    if (!accessToken || !refreshToken) {
      throw new Error('Invalid response: missing tokens');
    }
    
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(user));
    
    console.log('Tokens stored in localStorage');
    
    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
    }
  },

  // Refresh token
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken: refreshToken,
    });
    
    const responseData = response.data.data || response.data;
    const { accessToken, refreshToken: newRefreshToken, user } = responseData;
    
    return {
      user,
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  // Get current user from localStorage
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_access_token');
  },
};

export { apiClient as adminApiClient };
export default authAPI;
