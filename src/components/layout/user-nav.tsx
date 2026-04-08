"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/context/translation-context";
import { useAuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

export function UserNav() {
  const { t } = useTranslation();
  const { user, role, signOutUser } = useAuthContext();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOutUser();
    toast({ title: t("Signed out") });
  };

  const displayName = user?.displayName || t("User");
  const email = user?.email || t("No email");
  const fallback =
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  if (!user) {
    return (
      <Button asChild variant="default" size="sm">
        <Link href="/auth">{t("Sign in")}</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.photoURL || ""}
              alt={displayName}
              data-ai-hint="user avatar"
            />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {role === "admin" ? t("Admin") : t("Viewer")}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>{t("Profile")}</DropdownMenuItem>
          <DropdownMenuItem>{t("Settings")}</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("Log out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
