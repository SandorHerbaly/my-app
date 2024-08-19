import * as React from "react";
import Link from "next/link";
import {
  Home,
  ShoppingCart,
  Package,
  Users2,
  LineChart,
  Settings,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const getIconClasses = (path) => {
    return `flex h-9 w-9 items-center justify-center rounded-lg ${
      pathname === path ? "bg-[#E7ECF1] text-accent-foreground" : "text-muted-foreground"
    } transition-colors md:h-8 md:w-8 mt-5`;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-14 flex flex-col border-r bg-background sm:flex hidden md:flex">
      <nav className="flex flex-col items-center gap-3 px-2 pt-2 sm:py-2">
        {/* Dashboard (Home) Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard" className={getIconClasses("/dashboard")}>
              <Home className="h-5 w-5 mt-0" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Dashboard</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/orders" className={getIconClasses("/dashboard/orders")}>
              <ShoppingCart className="h-5 w-5 mt-0" />
              <span className="sr-only">Orders</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Orders</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/products" className={getIconClasses("/dashboard/products")}>
              <Package className="h-5 w-5 mt-0" />
              <span className="sr-only">Products</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Products</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/customers" className={getIconClasses("/dashboard/customers")}>
              <Users2 className="h-5 w-5 mt-0" />
              <span className="sr-only">Customers</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Customers</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/analytics" className={getIconClasses("/dashboard/analytics")}>
              <LineChart className="h-5 w-5 mt-0" />
              <span className="sr-only">Analytics</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Analytics</TooltipContent>
        </Tooltip>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-3 px-2 pb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/dashboard/settings" className={getIconClasses("/dashboard/settings")}>
              <Settings className="h-5 w-5 mt-0" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}
