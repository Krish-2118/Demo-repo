"use client";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { FirebaseClientProvider } from "@/firebase/client";
import { TranslationProvider } from "@/context/translation-context";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

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
      <body className={`${spaceGrotesk.className} h-full antialiased`}>
        <FirebaseClientProvider>
          <TranslationProvider>
            <div
              className={cn(
                "page-wrap grid min-h-screen w-full md:px-4",
                isSidebarCollapsed
                  ? "md:grid-cols-[80px_1fr]"
                  : "md:grid-cols-[240px_1fr]",
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
                <main className="flex flex-1 flex-col gap-5 px-3 pb-5 pt-3 sm:px-5 sm:pb-6 sm:pt-4 lg:px-8 lg:pb-8 lg:pt-6">
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
