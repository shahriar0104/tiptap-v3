'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { MdBusiness, MdDescription, MdDomain, MdGroup } from 'react-icons/md';

export default function OrganizationSetupPage() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [formData, setFormData] = useState({
    organizationName: '',
    domain: '',
    description: '',
    organizationSlug: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register-organization', {
        organizationName: formData.organizationName,
        domain: formData.domain,
        description: formData.description,
        user: {
          email: user?.email,
          name: user?.name,
          avatar: user?.avatar,
        },
      });

      if (response.success) {
        await refreshUser();
        router.push('/');
      } else {
        setError(response.message || 'Failed to create organization');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create organization');
    }

    setLoading(false);
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/join-organization', {
        organizationSlug: formData.organizationSlug,
        userData: {
          email: user?.email,
          name: user?.name,
          avatar: user?.avatar,
        },
      });

      if (response.success) {
        await refreshUser();
        router.push('/');
      } else {
        setError(response.message || 'Failed to join organization');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to join organization');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Organization Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a new organization or join an existing one
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              mode === 'create'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Create Organization
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
              mode === 'join'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Join Organization
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {mode === 'create' ? (
          <form className="mt-8 space-y-6" onSubmit={handleCreateOrganization}>
            <div className="space-y-4">
              <div>
                <label htmlFor="organizationName" className="sr-only">
                  Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdBusiness className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Organization name"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="domain" className="sr-only">
                  Company Domain (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdDomain className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="domain"
                    name="domain"
                    type="text"
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="company.com (optional)"
                    value={formData.domain}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="sr-only">
                  Description
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <MdDescription className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Brief description of your organization"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleJoinOrganization}>
            <div>
              <label htmlFor="organizationSlug" className="sr-only">
                Organization Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdGroup className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="organizationSlug"
                  name="organizationSlug"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Organization code (e.g., acme-corp)"
                  value={formData.organizationSlug}
                  onChange={handleInputChange}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Ask your organization admin for the organization code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Organization'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
