"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useTheme} from "@/contexts/ThemeProvider";
import {useAuth} from "@/contexts/AuthContext";
import React, {ReactNode} from "react";
import {MdDarkMode, MdDashboard, MdFolder, MdLightMode, MdLogout} from "react-icons/md";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/tiptap-ui-primitive/tooltip/tooltip";

function NavItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
      }`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const displayName = user?.name || user?.email?.split('@')[0] || 'Boardsmith User';
  const email = user?.email || '';
  const initials = (user?.name || user?.email || 'B')
    .split(' ')
    .map((s) => s?.[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-72 p-4 sm:p-6 flex flex-col gap-6 sticky top-0 min-h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
          {email && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
          )}
        </div>
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        <p className="px-3 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Navigation</p>
        <NavItem href="/dashboard" label="Dashboard" icon={<MdDashboard className="w-5 h-5" />} />
        <NavItem href="/documents" label="My Documents" icon={<MdFolder className="w-5 h-5" />} />
      </nav>

      {/* Bottom action bar: icon-only with tooltips */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Tooltip useDelayGroup>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition-all duration-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 cursor-pointer"
              >
                {theme === 'light' ? (
                  <MdDarkMode className="w-5 h-5" />
                ) : (
                  <MdLightMode className="w-5 h-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          <Tooltip useDelayGroup>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-red-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-red-400 transition-all duration-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 cursor-pointer"
              >
                <MdLogout className="w-5 h-5" />
                <span className="sr-only">Sign out</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Sign out</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}