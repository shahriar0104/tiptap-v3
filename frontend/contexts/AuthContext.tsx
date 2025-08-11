'use client';

import React, {createContext, useContext, useEffect, useState} from 'react';
import {authApi} from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'ADMIN' | 'MEMBER' | 'EDITOR' | 'BOARD_MEMBER';
  organizationId: string;
  organization: Organization;
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
  token: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage or URL on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Check for token or error in URL (from Google OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const oauthError = urlParams.get('error');
      
      if (oauthError) {
        // Handle OAuth error
        console.error('OAuth error:', oauthError);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setLoading(false);
        return;
      }
      
      if (urlToken) {
        // Token from Google OAuth redirect
        localStorage.setItem('auth_token', urlToken);
        setToken(urlToken);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        await refreshUser();
      } else {
        // Check for saved token
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
          setToken(savedToken);
          await refreshUser();
        } else {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const refreshUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setOrganization(null);
        return;
      }

      // Call backend to get user profile
      const response = await authApi.getProfile();

      if (response.success && response.data) {
        setUser(response.data);
        setOrganization(response.data.organization);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        setOrganization(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.signIn(email, password);

      if (response.success && response.data) {
        const authToken = response.data.token;
        localStorage.setItem('auth_token', authToken);
        setToken(authToken);
        
        // Set user and organization data
        setUser(response.data.user);
        setOrganization(response.data.organization);
        
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
      const response = await authApi.signInWithGoogle();
      
      if (response.success && response.data) {
        // Redirect to Google OAuth
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
      const response = await authApi.signUp(email, password, name);
      
      if (response.success) {
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
      await authApi.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setOrganization(null);
    }
  };

  // Update API calls to include auth token
  useEffect(() => {
    if (token) {
      // You can set a default header for authenticated requests here
      // This is handled in the individual API calls for now
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        loading,
        token,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        refreshUser,
      }}
    >
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
