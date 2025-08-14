// Authentication helper functions that call backend API
import { api } from './api';

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

interface LoginResponse {
  token: string;
  user: User;
  organization: Organization;
}

interface GoogleAuthResponse {
  redirectUrl: string;
}

export const authApi = {
  async signIn(email: string, password: string) {
    return await api.post<LoginResponse>('/auth/login', { email, password });
  },

  async signUp(email: string, password: string, name: string) {
    return await api.post('/auth/register', { email, password, name });
  },

  async signInWithGoogle() {
    return await api.post<GoogleAuthResponse>('/auth/google');
  },

  async signOut() {
    return await api.post('/auth/logout');
  },

  async getProfile() {
    return await api.get<User>('/auth/profile');
  },

  async refreshToken() {
    return await api.post('/auth/refresh');
  },

  async registerOrganization(data: {
    organizationName: string;
    domain?: string;
    description?: string;
    user: {
      email: string;
      name: string;
    };
  }) {
    return await api.post<LoginResponse>('/auth/register-organization', data);
  },

  async joinOrganization(organizationSlug: string, userData: any) {
    return await api.post<LoginResponse>('/auth/join-organization', {
      organizationSlug,
      userData,
    });
  },
};
