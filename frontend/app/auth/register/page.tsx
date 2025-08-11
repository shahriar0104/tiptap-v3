'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FcGoogle } from 'react-icons/fc';
import { MdBusiness, MdEmail, MdPerson, MdDescription, MdDomain, MdLock } from 'react-icons/md';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    domain: '',
    description: '',
    userName: '',
    userEmail: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Register organization with admin user directly through backend
      const response = await api.post<{
        token: string;
        organization: any;
        user: any;
      }>('/auth/register-organization', {
        organizationName: formData.organizationName,
        domain: formData.domain,
        description: formData.description,
        user: {
          email: formData.userEmail,
          name: formData.userName,
          password: formData.password,
        },
      });

      if (response.success && response.data?.token) {
        // Store token and redirect to dashboard
        localStorage.setItem('auth_token', response.data.token);
        router.push('/');
      } else {
        setError(response.message || 'Organization registration failed');
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    const result = await signInWithGoogle();
    
    if (!result.success) {
      setError(result.error || 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to existing account
            </a>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Organization Details */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Organization Details</h3>
              
              <div className="space-y-3">
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
            </div>

            {/* Admin User Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Admin User Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="userName" className="sr-only">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdPerson className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="userName"
                      name="userName"
                      type="text"
                      required
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Your full name"
                      value={formData.userName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="userEmail" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdEmail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="userEmail"
                      name="userEmail"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Your email address"
                      value={formData.userEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating organization...' : 'Create organization'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Sign up with Google
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
