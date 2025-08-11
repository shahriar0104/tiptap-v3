'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Define public routes that should not show sidebar
  const publicRoutes = [
    '/',           // Landing page
    '/auth/login',
    '/auth/register',
    '/auth/setup',
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Show sidebar only for authenticated users with organization on non-public routes
  const showSidebar = !loading && user && user.organizationId && !isPublicRoute;

  if (showSidebar) {
    // Authenticated layout with sidebar
    return (
      <div className="min-h-screen grid grid-cols-12">
        {/* Sidebar on lg+, stacked on mobile */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 border-r border-black/5 dark:border-white/10 bg-background">
          <Sidebar />
        </aside>
        <main className="col-span-12 lg:col-span-9 xl:col-span-10 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    );
  }

  // Public layout without sidebar
  return (
    <div className="min-h-screen">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
