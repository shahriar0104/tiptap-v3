'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'ADMIN' | 'EDITOR' | 'BOARD_MEMBER';
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requireRole,
  fallback 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to log in if not authenticated (keep hook order stable)
  const shouldRedirect = !loading && !user;
  React.useEffect(() => {
    if (shouldRedirect) {
      router.push('/auth/login');
    }
  }, [shouldRedirect, router]);
  if (shouldRedirect) return null;

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    );
  }

  // Type guard: at this point either user exists or we already returned above
  if (!user) return null;

  // Check role requirements
  if (requireRole) {
    const roleHierarchy = {
      'ADMIN': 4,
      'EDITOR': 3,
      'BOARD_MEMBER': 2,
      'MEMBER': 1,
      'VIEWER': 0,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requireRole] || 0;

    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don&#39;t have permission to access this page.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
