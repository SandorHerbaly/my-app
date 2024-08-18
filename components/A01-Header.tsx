"use client";

import * as React from "react";
import Link from "next/link";
import { 
  PanelLeft, Home, ShoppingCart, Package, Users2, LineChart, Settings, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { LuUser2 } from "react-icons/lu";
import { useViewport } from "@/app/contexts/ViewportContext";
import { Input } from "@/components/ui/input";

export function Header() {
  const { viewportSize } = useViewport();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-[#F9FBFD] px-4 sm:px-6 justify-between">
      {/* Left side of the header */}
      <div className="flex items-center gap-4 lg:gap-6">
        {viewportSize === 'mobile' && (
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1 hover:bg-accent">
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link href="/dashboard/orders" className="flex items-center gap-2 px-2 py-1 hover:bg-accent">
                  <ShoppingCart className="h-5 w-5" />
                  Orders
                </Link>
                <Link href="/dashboard/products" className="flex items-center gap-2 px-2 py-1 hover:bg-accent">
                  <Package className="h-5 w-5" />
                  Products
                </Link>
                <Link href="/dashboard/customers" className="flex items-center gap-2 px-2 py-1 hover:bg-accent">
                  <Users2 className="h-5 w-5" />
                  Customers
                </Link>
                <Link href="/dashboard/analytics" className="flex items-center gap-2 px-2 py-1 hover:bg-accent">
                  <LineChart className="h-5 w-5" />
                  Analytics
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-2 px-2 py-1 hover:bg-accent">
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        )}

        {viewportSize !== 'mobile' && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* Right side of the header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] pl-8 md:w-[200px] lg:w-[300px] bg-white"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full bg-background">
              <LuUser2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
