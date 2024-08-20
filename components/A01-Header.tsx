import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    submenu: ["Order History", "Pending Orders", "Shipped Orders", "Cancelled Orders", "Return Requests"],
  },
  "/dashboard/products": {
    title: "Products",
    submenu: ["Product List", "Add New Product", "Categories", "Inventory", "Product Reviews"],
  },
  "/dashboard/customers": {
    title: "Customers",
    submenu: ["Customer List", "Add New Customer", "Customer Segments", "Customer Feedback", "VIP Customers"],
  },
  "/dashboard/analytics": {
    title: "Analytics",
    submenu: ["Overview", "Sales Reports", "Customer Insights", "Product Performance", "Custom Reports"],
  },
  "/dashboard/tables": {
    title: "Tables",
    submenu: ["Table List", "Create Table", "Table Settings", "Table Reports", "Custom Tables"],
  },
  "/dashboard/transfers": {
    title: "Transfers",
    submenu: ["Internal Transfers", "External Transfers", "Transfer History", "Scheduled Transfers", "Transfer Reports"],
  },
  "/dashboard/invoices": {
    title: "Invoices",
    submenu: ["Invoice List", "Create Invoice", "Pending Invoices", "Paid Invoices", "Invoice Reports"],
  },
  "/dashboard/settings": {
    title: "Settings",
    submenu: ["General Settings", "User Management", "Payment Settings", "Notification Settings", "Integrations"],
  },
};

const MobileHeaderContent = ({ currentBreadcrumb }) => {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={currentBreadcrumb.title} />
        </SelectTrigger>
        <SelectContent>
          {currentBreadcrumb.submenu.map((item, index) => (
            <SelectItem key={index} value={item.toLowerCase().replace(/\s+/g, '-')}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const DesktopHeaderContent = ({ currentBreadcrumb }) => {
  return (
    <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xs lg:max-w-xs">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Select>
        <SelectTrigger className="w-full pl-8 pr-10 bg-white">
          <SelectValue placeholder={currentBreadcrumb.title} />
        </SelectTrigger>
        <SelectContent>
          {currentBreadcrumb.submenu.map((item, index) => (
            <SelectItem key={index} value={item.toLowerCase().replace(/\s+/g, '-')}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentBreadcrumb =
    pathname !== "/dashboard" ? breadcrumbOptions[pathname] || { title: "Dashboard", submenu: [] } : { title: "Dashboard", submenu: [] };

  const handleMenuItemClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-[#F9FBFD] px-4 sm:px-6 justify-between">
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Sheet gomb csak mobilnézetben */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item.href)}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-accent text-left w-full"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Breadcrumb - Desktop és tablet nézetben */}
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== "/dashboard" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={pathname}>{currentBreadcrumb.title}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Mobilnézet: Select komponens */}
      <div className="md:hidden flex-1">
        <MobileHeaderContent currentBreadcrumb={currentBreadcrumb} />
      </div>

      {/* Desktop és tablet nézet: Stílusozott Select komponens */}
      <div className="hidden md:flex flex-1 justify-center items-center md:justify-end">
        <DesktopHeaderContent currentBreadcrumb={currentBreadcrumb} />
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