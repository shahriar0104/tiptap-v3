'use client';

import React, {useEffect} from 'react';
import {motion} from 'framer-motion';
import {useAuth} from '@/contexts/AuthContext';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {MdAnalytics, MdArrowForward, MdCheck, MdGroups, MdRocketLaunch, MdSecurity} from "react-icons/md";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user && user.organizationId) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Boardsmith
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-x-4"
          >
            <Link 
              href="/auth/login"
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
        >
          AI-Enhanced Board
          <span className="text-blue-600"> Management</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
        >
          Streamline your board meetings with intelligent agenda management, 
          automated minutes, and powerful collaboration tools designed for modern organizations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-x-4"
        >
          <Link 
            href="/auth/register"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Free Trial
            <MdArrowForward className="ml-2 w-5 h-5" />
          </Link>
          <Link 
            href="/auth/login"
            className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-lg font-semibold rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            Sign In
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for Effective Board Governance
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Built for modern organizations that value efficiency, transparency, and strategic decision-making.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <MdRocketLaunch className="w-8 h-8" />,
              title: "Fast Setup",
              description: "Get your board meetings organized in minutes, not hours"
            },
            {
              icon: <MdSecurity className="w-8 h-8" />,
              title: "Enterprise Security",
              description: "Bank-level security with role-based access control"
            },
            {
              icon: <MdGroups className="w-8 h-8" />,
              title: "Team Collaboration",
              description: "Seamless collaboration tools for board members and executives"
            },
            {
              icon: <MdAnalytics className="w-8 h-8" />,
              title: "Smart Analytics",
              description: "AI-powered insights and automated meeting summaries"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
              className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-blue-600 dark:text-blue-400 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20 bg-white dark:bg-gray-800 rounded-2xl mx-6 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Transform Your Board Meetings
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Say goodbye to chaotic meetings and hello to structured, productive board governance.
            </p>
            
            <div className="space-y-4">
              {[
                "Automated agenda creation and distribution",
                "Real-time collaboration during meetings",
                "AI-powered meeting minutes and action items",
                "Secure document management and sharing",
                "Compliance tracking and reporting"
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <MdCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-blue-100 mb-6">
                Join thousands of organizations already using Boardsmith to run more effective board meetings.
              </p>
              <Link 
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Your Free Trial
                <MdArrowForward className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          &copy; 2024 Boardsmith. Built for modern board governance.
        </p>
      </footer>
    </div>
  );
}
