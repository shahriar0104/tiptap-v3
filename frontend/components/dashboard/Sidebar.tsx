"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useTheme} from "@/contexts/ThemeProvider";
import {useAuth} from "@/contexts/AuthContext";
import React, {ReactNode} from "react";
import {MdDarkMode, MdDashboard, MdFolder, MdLightMode, MdLogout} from "react-icons/md";

function NavItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 sticky top-0 min-h-screen">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">My Account</p>
          <p className="font-semibold">{user?.email || 'Boardsmith'}</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        <NavItem href="/dashboard" label="Dashboard" icon={<MdDashboard className="w-5 h-5" />} />
        <NavItem href="/documents" label="My Documents" icon={<MdFolder className="w-5 h-5" />} />
      </nav>

      {/* Bottom section with theme toggle and logout */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-3">
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
            <MdLogout className="w-5 h-5" />
          </span>
          <span className="font-medium">Sign Out</span>
        </button>
        
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition-all duration-200 border border-gray-300 dark:border-gray-600"
        >
          {theme === 'light' ? <MdDarkMode className="w-5 h-5" /> : <MdLightMode className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}