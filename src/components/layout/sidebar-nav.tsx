'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/translation-context';

type SidebarNavProps = {
  isMobile?: boolean;
};

export function SidebarNav({ isMobile = false }: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('Dashboard') },
    { href: '/leaderboard', icon: Trophy, label: t('Leaderboard') },
    { href: '/upload', icon: Upload, label: t('Upload Data') },
  ];

  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === item.href && 'bg-muted text-primary',
            isMobile && 'text-lg'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </>
  );
}
