import Link from 'next/link';
import { SidebarNav } from './sidebar-nav';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m4.93 17.66 1.41-1.41" />
            <path d="m17.66 4.93 1.41-1.41" />
          </svg>
          <span className="">DistrictEye</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4">
          <SidebarNav />
        </nav>
      </div>
    </aside>
  );
}
