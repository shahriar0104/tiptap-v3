"use client";

import React from "react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePathname } from "next/navigation";

export default function PageContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");

  return (
    <div className={isEditor ? "w-full" : "w-full xl:max-w-screen-xl xl:mx-auto"}>
      {/* Breadcrumbs for all non-editor pages */}
      {!isEditor && <Breadcrumbs />}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
