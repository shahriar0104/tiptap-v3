"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {useTheme} from "@/components/theme/ThemeProvider";
import React, {ReactNode} from "react";

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

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 sticky top-0 min-h-screen">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">My Account</p>
          <p className="font-semibold">Boardsmith</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        <NavItem href="/" label="Dashboard" icon={<span aria-hidden className="text-base">🏠</span>} />
        <NavItem href="/documents" label="My Documents" icon={<span aria-hidden className="text-base">📄</span>} />
      </nav>

      {/* Icon-only theme toggle */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          // disabled={pending}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition-all duration-200 border border-gray-300 dark:border-gray-600"
        >
          <span className="text-base">{theme === 'light' ? '🌙' : '☀️'}</span>
        </button>
      </div>
    </div>
  );
}