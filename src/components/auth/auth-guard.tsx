"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/context/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuthContext();

  const isAuthRoute = pathname === "/auth";
  const isUploadRoute = pathname.startsWith("/upload");

  const shouldRedirect = useMemo(() => {
    if (loading) return false;

    if (!user && !isAuthRoute) {
      return "/auth";
    }

    if (user && isAuthRoute) {
      return "/dashboard";
    }

    if (user && isUploadRoute && role !== "admin") {
      return "/dashboard";
    }

    return null;
  }, [isAuthRoute, isUploadRoute, loading, role, user]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(shouldRedirect);
    }
  }, [router, shouldRedirect]);

  if (loading || shouldRedirect) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
