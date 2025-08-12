import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import React from "react";
import {cookies} from 'next/headers';
import {ThemeProvider} from "@/contexts/ThemeProvider";
import {AuthProvider} from "@/contexts/AuthContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import {ToastProvider} from "@/contexts/ToastProvider";

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
            <ToastProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ToastProvider>
          </body>
        </AuthProvider>
      </ThemeProvider>
    </html>
  );
}
