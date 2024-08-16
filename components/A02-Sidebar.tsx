"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Users2, LineChart, Settings, Plus } from 'lucide-react';
import { LuArrowRightLeft } from "react-icons/lu";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LuGanttChartSquare } from "react-icons/lu";
import { LuTable2 } from "react-icons/lu";

export function Sidebar() {
  const pathname = usePathname();

  // Egyedi isActive ellenőrzés minden menüponthoz
  const isActive = (key: string) => pathname === key;

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/new" className="z-30">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                <Plus className="h-5 w-5" />
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Create New</TooltipContent>
        </Tooltip>
        {[
          { key: 'dashboard', href: '/dashboard', icon: Home, label: 'Kezdőlap' },
          { key: 'orders', href: '/dashboard/orders', icon: ShoppingCart, label: 'Rendelések' },
          { key: 'invoices', href: '/dashboard/invoices', icon: LuGanttChartSquare, label: 'Számlák' },
          { key: 'transfers', href: '/dashboard/transfers', icon: LuArrowRightLeft, label: 'Átutalások' },
          { key: 'products', href: '/dashboard/products', icon: Package, label: 'Termékek' },
          { key: 'users', href: '/dashboard/users', icon: Users2, label: 'Felhasználók' },
          { key: 'analytics', href: '/dashboard/analytics', icon: LineChart, label: 'Statisztikák' },
          { key: 'tables', href: '/dashboard/tables', icon: LuTable2, label: 'Táblázatok' }
        ].map(({ key, href, icon: Icon, label, iconSize = 'h-5 w-5' }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <Link href={href}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive(href) 
                    ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                  <Icon className={`${iconSize}`} /> {/* Itt történik a méret definiálása */}
                  <span className="sr-only">{label}</span>
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/settings">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isActive('/settings') 
                  ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}>
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}
