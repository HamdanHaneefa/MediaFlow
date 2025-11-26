// Client Portal Authentication API Service
import axios, { AxiosInstance } from 'axios';

// Client API should always use /api/client path
const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = BASE_API_URL.replace(/\/api$/, '') + '/api/client';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('client_access_token');
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

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('client_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data.data;
          
          localStorage.setItem('client_access_token', access_token);
          localStorage.setItem('client_refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('client_access_token');
        localStorage.removeItem('client_refresh_token');
        localStorage.removeItem('client_user');
        window.location.href = '/client/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  contactId: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    contact_id: string;
  };
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

// Authentication API methods
export const clientAuthAPI = {
  // Register new client
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data.data;
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    const { access_token, refresh_token, user } = response.data.data;
    
    // Store tokens and user info
    localStorage.setItem('client_access_token', access_token);
    localStorage.setItem('client_refresh_token', refresh_token);
    localStorage.setItem('client_user', JSON.stringify(user));
    
    return response.data.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('client_access_token');
      localStorage.removeItem('client_refresh_token');
      localStorage.removeItem('client_user');
    }
  },

  // Refresh token
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data.data;
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

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-verification');
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('client_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('client_access_token');
  },
};

export { apiClient as clientApiClient };
export default clientAuthAPI;
