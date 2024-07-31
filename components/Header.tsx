"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Monitor, Tablet, Smartphone } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Header({ setViewportSize }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mt-5">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <p className={`text-sm ${pathname === '/dashboard' ? 'font-bold' : ''}`}>Dashboard</p>
        </Link>
        {pathname !== '/dashboard' && (
          <>
            <span>/</span>
            <p className="text-sm">Orders</p>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Monitor className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setViewportSize('desktop')}>
              <Monitor className="mr-2 h-4 w-4" /> Desktop
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setViewportSize('tablet')}>
              <Tablet className="mr-2 h-4 w-4" /> Tablet
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setViewportSize('mobile')}>
              <Smartphone className="mr-2 h-4 w-4" /> Mobile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]" />
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}