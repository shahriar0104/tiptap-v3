'use client';

import React, {createContext, useContext, useEffect, useState} from 'react';
import {api} from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'ADMIN' | 'MEMBER' | 'EDITOR' | 'BOARD_MEMBER';
  organizationId?: string;
  organization?: Organization;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  domain?: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication on mount - check for existing session via cookies
  useEffect(() => {
    const initializeAuth = async () => {
      // Check for OAuth error in URL (from Google OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const oauthError = urlParams.get('error');
      
      if (oauthError) {
        // Handle OAuth error
        console.error('OAuth error:', oauthError);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setLoading(false);
        return;
      }
      
      // Check for existing session via cookies by calling profile endpoint
      await refreshUser();
    };

    initializeAuth();
  }, []);

  const refreshUser = async () => {
    try {
      // Call backend to get user profile - cookies are automatically included
      const response = await api.get<User>('/auth/profile');

      if (response.success && response.data) {
        setUser(response.data);
        setOrganization(response.data.organization || null);
      } else {
        // No valid session
        setUser(null);
        setOrganization(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Clear user state on error
      setUser(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post<{
        user: User;
        organization?: Organization;
      }>('/auth/login', { email, password });

      if (response.success && response.data) {
        // Cookies are automatically set by the backend
        // Update local state with user data
        setUser(response.data.user);
        setOrganization(response.data.organization || null);
        
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const response = await api.get<{
        redirectUrl: string;
      }>('/auth/google');
      
      if (response.success && response.data) {
        // Redirect to Google OAuth URL provided by backend
        window.location.href = response.data.redirectUrl;
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Google login failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Google login failed' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post<{
        user: User;
        organization?: Organization;
        requiresVerification?: boolean;
      }>('/auth/register', { email, password, name });
      
      if (response.success) {
        // If user is automatically logged in (no email verification), update state
        if (response.data?.user && !response.data?.requiresVerification) {
          setUser(response.data.user);
          setOrganization(response.data.organization || null);
        }
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const signOut = async () => {
    try {
      // Call backend logout to clear cookies
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setOrganization(null);
    }
  };

  const value: AuthContextType = {
    user,
    organization,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
