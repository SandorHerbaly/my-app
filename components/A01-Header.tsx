import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Users2,
  LineChart,
  Settings,
  Search,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LuUser2, LuChevronDown } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const breadcrumbOptions = {
  "/dashboard/orders": {
    title: "Orders",
    submenu: [
      "Order History",
      "Pending Orders",
      "Shipped Orders",
      "Cancelled Orders",
      "Return Requests",
    ],
  },
  "/dashboard/products": {
    title: "Products",
    submenu: [
      "Product List",
      "Add New Product",
      "Categories",
      "Inventory",
      "Product Reviews",
    ],
  },
  "/dashboard/customers": {
    title: "Customers",
    submenu: [
      "Customer List",
      "Add New Customer",
      "Customer Segments",
      "Customer Feedback",
      "VIP Customers",
    ],
  },
  "/dashboard/analytics": {
    title: "Analytics",
    submenu: [
      "Overview",
      "Sales Reports",
      "Customer Insights",
      "Product Performance",
      "Custom Reports",
    ],
  },
  "/dashboard/settings": {
    title: "Settings",
    submenu: [
      "General Settings",
      "User Management",
      "Payment Settings",
      "Notification Settings",
      "Integrations",
    ],
  },
  "/dashboard/transfers": {
    title: "Transfers",
    submenu: [
      "Internal Transfers",
      "External Transfers",
      "Transfer History",
      "Scheduled Transfers",
      "Transfer Reports",
    ],
  },
  "/dashboard/invoices": {
    title: "Invoices",
    submenu: [
      "Invoice List",
      "Create Invoice",
      "Pending Invoices",
      "Paid Invoices",
      "Invoice Reports",
    ],
  },
  "/dashboard/tables": {
    title: "Tables",
    submenu: [
      "Table List",
      "Create Table",
      "Table Settings",
      "Table Reports",
      "Custom Tables",
    ],
  },
};

export function Header() {
  const pathname = usePathname();

  const currentBreadcrumb =
    pathname !== "/dashboard" ? breadcrumbOptions[pathname] || { title: "Dashboard", submenu: [] } : { title: "Dashboard", submenu: [] };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-[#F9FBFD] px-4 sm:px-6 justify-between">
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Sheet gomb csak mobilnézetben */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="md:hidden flex items-center justify-center"
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-2 py-1 hover:bg-accent"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/orders"
                className="flex items-center gap-2 px-2 py-1 hover:bg-accent"
              >
                <ShoppingCart className="h-5 w-5" />
                Orders
              </Link>
              <Link
                href="/dashboard/products"
                className="flex items-center gap-2 px-2 py-1 hover:bg-accent"
              >
                <Package className="h-5 w-5" />
                Products
              </Link>
              <Link
                href="/dashboard/customers"
                className="flex items-center gap-2 px-2 py-1 hover:bg-accent"
              >
                <Users2 className="h-5 w-5" />
                Customers
              </Link>
              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-2 px-2 py-1 hover:bg-accent"
              >
                <LineChart className="h-5 w-5" />
                Analytics
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-2 py-1 hover:bg-accent"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Breadcrumb - Dashboard lenyíló menüvel */}
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  Dashboard
                  <LuChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/products">Products</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/customers">Customers</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/analytics">Analytics</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            {pathname !== "/dashboard" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      {currentBreadcrumb.title}
                      {currentBreadcrumb.submenu.length > 0 && (
                        <LuChevronDown className="h-4 w-4" />
                      )}
                    </DropdownMenuTrigger>
                    {currentBreadcrumb.submenu.length > 0 && (
                      <DropdownMenuContent align="start">
                        {currentBreadcrumb.submenu.map((item, index) => (
                          <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-1 justify-center items-center md:justify-end">
        <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xs lg:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-8 pr-10 bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background"
        >
          <LuUser2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
