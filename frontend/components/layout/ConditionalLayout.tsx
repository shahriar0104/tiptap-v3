'use client';

import React from 'react';
import {useAuth} from '@/contexts/AuthContext';
import {usePathname, useRouter} from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import PageContainer from '@/components/layout/PageContainer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  // Define public routes that should not show sidebar and don't require authentication
  const publicRoutes = [
    '/',           // Landing page
    '/auth/login',
    '/auth/register',
    '/auth/setup',
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Centralized authentication guard for protected routes
  // Redirect and return null immediately to prevent flash of content
  if (!isPublicRoute && !user) {
    router.push('/auth/login');
    return null;
  }

  // Show sidebar only for authenticated users with organization on non-public routes
  const showSidebar = user && user.organizationId && !isPublicRoute;

  if (showSidebar) {
    // Authenticated layout with sidebar
    return (
      <div className="min-h-screen grid grid-cols-12">
        {/* Sidebar on lg+, stacked on mobile */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 border-r border-black/5 dark:border-white/10 bg-background">
          <Sidebar />
        </aside>
        <main className="col-span-12 lg:col-span-9 xl:col-span-10 p-4 sm:p-6 lg:p-8">
          <PageContainer>
            {children}
          </PageContainer>
        </main>
      </div>
    );
  }

  // Public layout without a sidebar
  return (
    <div className="min-h-screen">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
