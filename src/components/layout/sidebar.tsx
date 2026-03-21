import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/context/translation-context";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  return (
    <aside
      className={cn(
        "relative hidden h-full flex-col rounded-2xl border border-border/80 bg-card/95 shadow-sm md:flex transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[240px]",
      )}
    >
      <div
        className={cn(
          "flex h-[64px] items-center border-b border-border/70 px-4",
          isCollapsed ? "justify-center" : "justify-start",
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-sm font-semibold tracking-tight text-primary",
            isCollapsed && "justify-center",
          )}
        >
          <span className={cn(isCollapsed && "hidden")}>
            {t("DistrictEye")}
          </span>
        </Link>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("ml-auto", isCollapsed && "mx-auto")}
                onClick={onToggle}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav
          className={cn(
            "grid items-start text-sm font-medium",
            isCollapsed ? "px-2" : "px-3",
          )}
        >
          <SidebarNav isCollapsed={isCollapsed} />
        </nav>
      </div>
    </aside>
  );
}
