import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuUser2, LuChevronDown, LuLayoutGrid, LuArrowRightLeft } from "react-icons/lu";
import {
  ShoppingCart,
  Package,
  Users2,
  LineChart,
  Settings,
  Search,
  PanelLeft,
  FileText,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LuLayoutGrid },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/customers", label: "Customers", icon: Users2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: LineChart },
  { href: "/dashboard/tables", label: "Tables", icon: Table },
  { href: "/dashboard/transfers", label: "Transfers", icon: LuArrowRightLeft },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-white border-b border-gray-300 px-4 sm:px-6 justify-between md:bg-[#F9FBFD] md:border-none">
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Sheet gomb csak mobilnézetben */}
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="md:hidden flex items-center justify-center"> {/* Ikon középre igazítása */}
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              {menuItems.map((item, index) => (
                <Link key={index} href={item.href} className="flex items-center gap-2 px-2 py-1 hover:bg-accent">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
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
                  {menuItems.map((item, index) => (
                    <DropdownMenuItem asChild key={index}>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
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
        <Button variant="outline" size="icon" className="rounded-full bg-background">
          <LuUser2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
