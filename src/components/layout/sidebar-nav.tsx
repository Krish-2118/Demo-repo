'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Upload,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/upload', icon: Upload, label: 'Upload Data' },
  { href: '/report', icon: FileText, label: 'Reports' },
];

type SidebarNavProps = {
  isMobile?: boolean;
};

export function SidebarNav({ isMobile = false }: SidebarNavProps) {
  const pathname = usePathname();

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
