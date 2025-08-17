'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { MdBusiness } from 'react-icons/md';

export default function OrganizationSetupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.organizationId) {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Organization Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This setup page has been simplified. To create a new organization, use the Register flow below.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <MdBusiness className="h-6 w-6" />
            <span>Create a new organization as an Admin</span>
          </div>
          <Link
            href="/auth/register"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Registration
          </Link>

          <div className="text-center text-sm text-gray-500">Already have an account?</div>
          <Link
            href="/auth/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
