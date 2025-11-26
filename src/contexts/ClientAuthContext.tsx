// Client Authentication Context
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { clientAuthAPI, AuthResponse, RegisterData } from '../services/api/clientAuth';

interface User {
  id: string;
  email: string;
  contact_id: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const ClientAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = clientAuthAPI.getCurrentUser();
        const isAuth = clientAuthAPI.isAuthenticated();
        
        if (currentUser && isAuth) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await clientAuthAPI.login({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await clientAuthAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear user anyway on logout failure
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await clientAuthAPI.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default ClientAuthProvider;
