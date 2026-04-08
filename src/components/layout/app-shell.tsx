"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setIsSidebarCollapsed(false);
  }, [pathname]);

  const isAuthPage = pathname === "/auth";

  return (
    <AuthGuard>
      <div
        className={cn(
          "page-wrap grid min-h-screen w-full md:px-4",
          !isAuthPage &&
            (isSidebarCollapsed
              ? "md:grid-cols-[80px_1fr]"
              : "md:grid-cols-[240px_1fr]"),
        )}
      >
        {!isAuthPage && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((current) => !current)}
          />
        )}
        <div className="flex min-w-0 flex-col">
          {!isAuthPage && <Header />}
          <main className="flex flex-1 flex-col gap-5 px-3 pb-5 pt-3 sm:px-5 sm:pb-6 sm:pt-4 lg:px-8 lg:pb-8 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
