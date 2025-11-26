import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, type User, type LoginCredentials, type RegisterData } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Auto refresh token before it expires (every 14 minutes, token expires in 15)
  useEffect(() => {
    if (!user) return;

    const doRefresh = async () => {
      try {
        await refreshToken();
      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    };

    const interval = setInterval(doRefresh, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      
      // Store tokens
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Set user
      setUser(response.user);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(data);
      
      // Store tokens
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Set user
      setUser(response.user);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setError(null);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await authAPI.refresh(refreshToken);
      
      // Update tokens
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Update user if provided
      if (response.user) {
        setUser(response.user);
      }
      
      return true;
    } catch (err) {
      console.error('Token refresh error:', err);
      // If refresh fails, log out
      await logout();
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await authAPI.forgotPassword({ email });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset request failed';
      setError(errorMessage);
      console.error('Forgot password error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await authAPI.resetPassword({ token, password, confirmPassword: password });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      console.error('Reset password error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
