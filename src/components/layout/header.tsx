import Link from "next/link";
import { PanelLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "./user-nav";
import { SidebarNav } from "./sidebar-nav";
import { Input } from "../ui/input";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslation } from "@/context/translation-context";
import { useState } from "react";

export function Header() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="surface-panel sticky top-2 z-30 mx-1.5 mb-1 flex h-14 items-center gap-2 px-2.5 sm:mx-0 sm:mb-0 sm:h-16 sm:gap-3 sm:px-4">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 shrink-0 md:hidden"
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">{t("Toggle Menu")}</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[88vw] max-w-[320px] sm:max-w-xs"
        >
          <SheetTitle className="sr-only">{t("Navigation Menu")}</SheetTitle>
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex h-10 items-center gap-2 rounded-xl bg-primary/10 px-3 text-sm font-semibold text-primary"
            >
              {t("DistrictEye")}
            </Link>
            <SidebarNav
              isMobile={true}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </nav>
        </SheetContent>
      </Sheet>

      <div className="relative hidden min-w-[180px] flex-1 md:block md:max-w-[260px] lg:max-w-[360px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("Search...")}
          className="h-10 w-full rounded-xl border-border/80 bg-background/80 pl-8"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <LanguageSwitcher />
      </div>
      <UserNav />
    </header>
  );
}
