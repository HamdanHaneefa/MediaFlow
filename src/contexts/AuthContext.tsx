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
        const token = localStorage.getItem('admin_access_token');
        
        if (token) {
          try {
            const currentUser = await authAPI.getCurrentUser();
            setUser(currentUser);
          } catch (apiError: any) {
            console.error('Authentication check failed:', apiError);
            
            // Only clear tokens if it's an authentication error (401)
            if (apiError.response?.status === 401) {
              console.log('Token invalid - clearing stored credentials');
              localStorage.removeItem('admin_access_token');
              localStorage.removeItem('admin_refresh_token');
              localStorage.removeItem('admin_user');
            } else {
              // Network error or server error - keep the token!
              console.log('Network error during auth check - keeping token');
              
              // Try to load user from localStorage as fallback
              const storedUser = localStorage.getItem('admin_user');
              if (storedUser) {
                setUser(JSON.parse(storedUser));
              }
            }
          }
        } else {
          // No token found - user not logged in
        }
      } catch (err) {
        console.error('❌ Auth check error:', err);
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
      
      // auth.ts already stores tokens, just set user
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
      
      // auth.ts already stores tokens, just set user
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
      // auth.ts handles localStorage cleanup
      setUser(null);
      setError(null);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (!refreshToken) return false;

      const response = await authAPI.refresh(refreshToken);
      
      // auth.ts interceptor already updates tokens
      
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
