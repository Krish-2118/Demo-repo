"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/translation-context";
import { useAuthContext } from "@/context/auth-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SidebarNavProps = {
  isMobile?: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({
  isMobile = false,
  isCollapsed = false,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { role } = useAuthContext();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("Dashboard") },
    { href: "/leaderboard", icon: Trophy, label: t("Leaderboard") },
    ...(role === "admin"
      ? [{ href: "/upload", icon: Upload, label: t("Upload Data") }]
      : []),
  ];

  const renderLink = (item: (typeof navItems)[number]) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => onNavigate?.()}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary",
        pathname === item.href && "bg-primary/10 text-primary",
        isMobile && "text-base",
        isCollapsed && "justify-center",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span
        className={cn(
          isCollapsed && !isMobile && "sr-only",
          "whitespace-nowrap",
        )}
      >
        {item.label}
      </span>
    </Link>
  );

  if (isCollapsed && !isMobile) {
    return (
      <TooltipProvider>
        {navItems.map((item) => (
          <Tooltip key={item.href} delayDuration={0}>
            <TooltipTrigger asChild>{renderLink(item)}</TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-4">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    );
  }

  return <>{navItems.map((item) => renderLink(item))}</>;
}
