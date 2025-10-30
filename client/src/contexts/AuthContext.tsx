// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone_number: string;
  profile_image?: string;
  is_verified: boolean;
  company_name?: string;
  license_number?: string;
  bio?: string;
  date_joined: string;
  profile?: {
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    email_notifications: boolean;
    sms_notifications: boolean;
    preferred_locations: string[];
    price_range_min: number | null;
    price_range_max: number | null;
    preferred_property_types: string[];
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean; // Add this line
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Add isAuthenticated as a computed property
  const isAuthenticated = !!user;

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      
      // Handle different response structures
      if (response && response.user) {
        // Case 1: { user: {...} }
        setUser(response.user);
      } else if (response && response.id) {
        // Case 2: Direct user object { id: ..., username: ... }
        setUser(response);
      } else if (response && response.success && response.user) {
        // Case 3: { success: true, user: {...} }
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      
      let userData: User | null = null;
      
      // Handle different response structures
      if (response && response.user) {
        userData = response.user;
      } else if (response && response.id) {
        userData = response;
      } else if (response && response.success && response.user) {
        userData = response.user;
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      let userData: User | null = null;
      
      // Handle different response structures for login
      if (response && response.user) {
        userData = response.user;
      } else if (response && response.id) {
        userData = response;
      } else if (response && response.success && response.user) {
        userData = response.user;
      } else if (response) {
        // If response is the user object directly
        userData = response;
      }
      
      if (userData) {
        setUser(userData);
        toast.success('Welcome back!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      let newUser: User | null = null;
      
      // Handle different response structures for registration
      if (response && response.user) {
        newUser = response.user;
      } else if (response && response.id) {
        newUser = response;
      } else if (response && response.success && response.user) {
        newUser = response.user;
      } else if (response) {
        newUser = response;
      }
      
      if (newUser) {
        setUser(newUser);
        toast.success('Account created successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated, // Add this to the context value
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};