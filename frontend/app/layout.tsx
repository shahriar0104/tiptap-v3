import type {Metadata} from "next";
import { Bricolage_Grotesque, Space_Grotesk, Merriweather } from "next/font/google";
import "./globals.css";
import React from "react";
import {cookies} from 'next/headers';
import {ThemeProvider} from "@/contexts/ThemeProvider";
import {AuthProvider} from "@/contexts/AuthContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import {ToastProvider} from "@/contexts/ToastProvider";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

// EB Garamond removed per design update

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

  const fontVars = `${bricolage.variable} ${spaceGrotesk.variable} ${merriweather.variable}`;
  const bodyFont = merriweather.className; // enforce Merriweather as base font
  return (
    <html lang="en" className={`${bodyFont} ${fontVars} ${serverTheme === 'dark' ? 'dark' : ''}`}>
      <body className={`${bodyFont} ${fontVars} antialiased`}>
        <ThemeProvider serverTheme={serverTheme}>
          <AuthProvider>
            <ToastProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
