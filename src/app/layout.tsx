'use client';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { FirebaseClientProvider } from '@/firebase/client';
import { TranslationProvider } from '@/context/translation-context';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased h-full`}>
        <FirebaseClientProvider>
          <TranslationProvider>
            <div
              className={cn(
                'grid min-h-screen w-full md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr]'
              )}
            >
              {isClient && (
                <Sidebar
                  isCollapsed={isSidebarCollapsed}
                  onToggle={toggleSidebar}
                />
              )}
              <div className="flex flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </TranslationProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
