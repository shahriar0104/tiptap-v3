"use client";

import Link from "next/link";
import { MdChevronRight, MdHome } from "react-icons/md";
import { useBreadcrumbItems } from "@/components/layout/breadcrumbsStore";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const items = useBreadcrumbItems();
  const pathname = usePathname();

  // If no items provided, render nothing
  if (!items.length) return null;
  // Do not show breadcrumbs on dashboard or root
  if (pathname === "/dashboard" || pathname === "/") return null;

  return (
    <nav aria-label="Breadcrumb" className="font-breadcrumb mb-4">
      <ol className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 cursor-pointer"
          >
            <MdHome className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </li>
        {items.map((c, idx) => (
          <li key={`${c.label}-${idx}`} className="flex items-center">
            <MdChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            {idx < items.length - 1 && c.href ? (
              <Link
                href={c.href}
                className="rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 cursor-pointer"
              >
                {c.label}
              </Link>
            ) : (
              <span className="px-2 py-1 text-gray-700 dark:text-gray-200" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
