
import Link from 'next/link';
import { SidebarNav } from './sidebar-nav';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden h-full flex-col border-r bg-background md:flex transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-60'
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'
        )}
      >
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 font-semibold',
            isCollapsed && 'justify-center'
          )}
        >
          <span className={cn(isCollapsed && 'hidden')}>DistrictEye</span>
        </Link>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('ml-auto', isCollapsed && 'mx-auto')}
                        onClick={onToggle}
                    >
                        {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                        ) : (
                        <ChevronLeft className="h-5 w-5" />
                        )}
                        <span className="sr-only">
                        {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        </span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                {isCollapsed ? 'Expand' : 'Collapse'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav
          className={cn(
            'grid items-start px-2 text-sm font-medium lg:px-4',
            isCollapsed && 'px-2'
          )}
        >
          <SidebarNav isCollapsed={isCollapsed} />
        </nav>
      </div>
    </aside>
  );
}
