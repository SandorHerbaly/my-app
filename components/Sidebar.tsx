"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Users2, LineChart, Settings, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

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
          { href: '/dashboard', icon: Home, label: 'Dashboard' },
          { href: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
          { href: '/dashboard/products', icon: Package, label: 'Products' },
          { href: '/dashboard/customers', icon: Users2, label: 'Customers' },
          { href: '/dashboard/analytics', icon: LineChart, label: 'Analytics' },
        ].map(({ href, icon: Icon, label }) => (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <Link href={href}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive(href) 
                    ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                  <Icon className="h-5 w-5" />
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