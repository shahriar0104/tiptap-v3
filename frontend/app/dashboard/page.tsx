'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CardButton from "@/components/ui-helper/CardButton";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MdAdd, 
  MdHistory, 
  MdLink, 
  MdPictureAsPdf, 
  MdFolder 
} from "react-icons/md";

export default function Dashboard() {
  const { user, organization } = useAuth();

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {organization?.name || 'Board Meeting'} Dashboard
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Welcome back, {user?.name || user?.email}! Manage your board meetings and agendas with ease
          </motion.p>
        </div>

        {/* Board Meetings Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Board Meetings
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Create and manage your board meetings
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardButton
              href="/meeting/new"
              title="Create New Meeting"
              description="Set up a new board meeting with agenda"
              icon={<MdAdd className="w-6 h-6" />}
              tone="brand"
            />
            <CardButton
              href="/meeting/past"
              title="View Past Meetings"
              description="Browse previous board meetings and their records"
              icon={<MdHistory className="w-6 h-6" />}
            />
          </div>
        </section>

        {/* Data Repo Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Data Repository
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Connect and manage your document sources
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardButton
              href="/connectors/zero"
              title="Zero Connector"
              description="Automated data sync"
              icon={<MdLink className="w-6 h-6" />}
              tone="brand"
            />
            <CardButton
              href="/import/pdf"
              title="PDF Import"
              description="Upload and process PDF documents"
              icon={<MdPictureAsPdf className="w-6 h-6" />}
            />
            <CardButton
              href="/repo"
              title="Document Repository"
              description="Browse and search all your documents"
              icon={<MdFolder className="w-6 h-6" />}
            />
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
