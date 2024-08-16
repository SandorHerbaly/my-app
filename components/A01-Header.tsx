"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Monitor, Tablet, Smartphone, ChevronDownIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Header({ setViewportSize }) {
  const pathname = usePathname();
  const [currentViewport, setCurrentViewport] = useState('desktop');

  // Breadcrumb létrehozása az aktuális útvonal alapján
  const getBreadcrumbItems = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbItems = [];
  
    paths.forEach((path, index) => {
      // Útvonal szövegének átalakítása a megjelenítéshez
      let displayText = path.charAt(0).toUpperCase() + path.slice(1);
      
      // Útvonalak átalakítása a megfelelő megjelenítéshez
      if (displayText.toLowerCase() === 'dashboard') {
        displayText = 'Kezdőlap';
      } else if (displayText.toLowerCase() === 'orders') {
        displayText = 'Rendelések';
      } else if (displayText.toLowerCase() === 'invoices') {
        displayText = 'Számlák';
      } else if (displayText.toLowerCase() === 'transfers') {
        displayText = 'Átutalások';
      } else if (displayText.toLowerCase() === 'products') {
        displayText = 'Termékek';
      } else if (displayText.toLowerCase() === 'users') {
        displayText = 'Felhasználók';
      } else if (displayText.toLowerCase() === 'analytics') {
        displayText = 'Statisztikák';
      } else if (displayText.toLowerCase() === 'tables') {
        displayText = 'Táblázatok';
      }

      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const isLast = index === paths.length - 1;

      // Ha az utolsó breadcrumb elem, akkor DropdownMenuTrigger lesz
      if (isLast) {
        breadcrumbItems.push(
          <DropdownMenu key={href}>
            <DropdownMenuTrigger asChild>
              <Link href={href} className={`text-sm ${isLast ? 'font-bold flex items-center gap-1' : ''}`}>
                {displayText} <ChevronDownIcon />
              </Link>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Documentation</DropdownMenuItem>
              <DropdownMenuItem>Themes</DropdownMenuItem>
              <DropdownMenuItem>GitHub</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      } else {
        breadcrumbItems.push(
          <span key={href} className="flex items-center">
            <Link href={href} className={`text-sm ${isLast ? 'font-bold' : ''}`}>
              {displayText}
            </Link>
            {!isLast && <span className="mx-2">/</span>}
          </span>
        );
      }
    });
  
    return breadcrumbItems;
  };

  // Képernyőméret módosítása
  const handleViewportChange = (size) => {
    setCurrentViewport(size);  // Állapot frissítése a kiválasztott mérettel
    setViewportSize(size);

    if (size === 'tablet') {
      document.body.style.width = '768px'; // Tablet méret
    } else if (size === 'mobile') {
      document.body.style.width = '375px'; // Mobile méret
    } else {
      document.body.style.width = '100%'; // Desktop méret
    }
  };

  const getCurrentIcon = () => {
    if (currentViewport === 'tablet') {
      return <Tablet className="h-4 w-4" />;
    } else if (currentViewport === 'mobile') {
      return <Smartphone className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mt-5">
      <div className="flex items-center gap-2">
        {getBreadcrumbItems()}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              {getCurrentIcon()} {/* Az ikon frissítése a kiválasztott nézet alapján */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleViewportChange('desktop')}>
              <Monitor className="mr-2 h-4 w-4" /> Desktop
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleViewportChange('tablet')}>
              <Tablet className="mr-2 h-4 w-4" /> Tablet
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleViewportChange('mobile')}>
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
