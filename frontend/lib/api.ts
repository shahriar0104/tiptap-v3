"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Production-grade API helper with secure HTTP-only cookie authentication
 * No localStorage token handling - all authentication via secure cookies
 */
export const api = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include', // Always include cookies for authentication
      ...options,
    });
    return response.json();
  },

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Always include cookies for authentication
      ...options,
    });
    return response.json();
  },

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Always include cookies for authentication
      ...options,
    });
    return response.json();
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include', // Always include cookies for authentication
      ...options,
    });
    return response.json();
  },
};
