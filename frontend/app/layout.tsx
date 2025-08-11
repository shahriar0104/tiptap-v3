import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import React from "react";
import {cookies} from 'next/headers';
import {ThemeProvider} from "@/components/theme/ThemeProvider";
import {AuthProvider} from "@/contexts/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boardsmith",
  description: "AI‑enhanced board management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Runs on the server for every request
  const cookieStore = await cookies();
  const serverTheme = (cookieStore.get('theme')?.value as 'light' | 'dark') ?? 'light';

  return (
    <html lang="en" className={serverTheme === 'dark' ? 'dark' : ''}>
    <ThemeProvider serverTheme={serverTheme}>
      <AuthProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <div className="min-h-screen grid grid-cols-12">
          {/* Sidebar on lg+, stacked on mobile */}
          <aside className="col-span-12 lg:col-span-3 xl:col-span-2 border-r border-black/5 dark:border-white/10 bg-background">
            <Sidebar />
          </aside>
          <main className="col-span-12 lg:col-span-9 xl:col-span-10 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
        </body>
      </AuthProvider>
    </ThemeProvider>
    </html>
  );
}
