import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
  { href: "/dashboard/p1_orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/p2_financial_receipts", label: "Financial Receipts", icon: FileText },
  { href: "/dashboard/p3_transfers", label: "Transfers", icon: LuArrowRightLeft },
  { href: "/dashboard/p4_products", label: "Products", icon: Package },
  { href: "/dashboard/p5_customers", label: "Customers", icon: Users2 },
  { href: "/dashboard/p6_analytics", label: "Analytics", icon: LineChart },
  { href: "/dashboard/p7_tables", label: "Tables", icon: Table },
  { href: "/dashboard/p8_settings", label: "Settings", icon: Settings },
];

const breadcrumbOptions = {
  "/dashboard/p1_orders": {
    title: "Orders",
    path: "/dashboard/p1_orders",
    submenu: [
      { label: "Order History", path: "/dashboard/p1_orders/p1a_order_history" },
      { label: "Pending Orders", path: "/dashboard/p1_orders/p1b_pending_orders" },
      { label: "Shipped Orders", path: "/dashboard/p1_orders/p1c_shipped_orders" },
      { label: "Cancelled Orders", path: "/dashboard/p1_orders/p1d_cancelled_orders" },
      { label: "Return Requests", path: "/dashboard/p1_orders/p1e_return_requests" },
    ],
  },
  "/dashboard/p2_financial_receipts": {
    title: "Financial Receipts",
    path: "/dashboard/p2_financial_receipts",
    submenu: [
      { label: "Upload Financial Receipts", path: "/dashboard/p2_financial_receipts/p2a_upload_financial_receipts" },
      { label: "Analyse Financial Receipts", path: "/dashboard/p2_financial_receipts/p2b_analyse_financial_receipts" },
      { label: "Pending Invoices", path: "/dashboard/p2_financial_receipts/p2c_pending_invoices" },
      { label: "Paid Invoices", path: "/dashboard/p2_financial_receipts/p2d_paid_invoices" },
      { label: "Invoice Reports", path: "/dashboard/p2_financial_receipts/p2e_invoice_reports" },
    ],
  },
  // ... (többi breadcrumbOption változatlan)
};

const MobileHeaderContent = ({ currentBreadcrumb, onSelectChange, currentPath }) => {
  if (!currentBreadcrumb.submenu || currentBreadcrumb.submenu.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Select onValueChange={onSelectChange} value={currentPath}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={currentBreadcrumb.title} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={currentBreadcrumb.path}>{currentBreadcrumb.title}</SelectItem>
          {currentBreadcrumb.submenu.map((item) => (
            <SelectItem key={item.path} value={item.path}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const DesktopHeaderContent = ({ currentBreadcrumb, onSelectChange, currentPath }) => {
  if (!currentBreadcrumb.submenu || currentBreadcrumb.submenu.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xs lg:max-w-xs">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Select onValueChange={onSelectChange} value={currentPath}>
        <SelectTrigger className="w-full pl-8 pr-10 bg-white">
          <SelectValue placeholder={currentBreadcrumb.title} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={currentBreadcrumb.path}>{currentBreadcrumb.title}</SelectItem>
          {currentBreadcrumb.submenu.map((item) => (
            <SelectItem key={item.path} value={item.path}>
              {item.label}
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

  const getPageInfo = (path) => {
    const parts = path.split('/');
    const mainPath = `/${parts[1]}/${parts[2]}`;
    const mainBreadcrumb = breadcrumbOptions[mainPath] || { title: "Dashboard", submenu: [], path: "/dashboard" };
    const subPageInfo = mainBreadcrumb.submenu?.find(item => item.path === path);
    
    return {
      mainBreadcrumb,
      subPageTitle: subPageInfo ? subPageInfo.label : null,
      currentPath: subPageInfo ? subPageInfo.path : mainPath
    };
  };

  const { mainBreadcrumb, subPageTitle, currentPath } = getPageInfo(pathname);

  const handleSelectChange = (value) => {
    router.push(value);
  };

  const handleMenuItemClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-[#F9FBFD] px-4 sm:px-6 justify-between">
      <div className="flex items-center gap-4 lg:gap-6">
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

        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            {mainBreadcrumb.title !== "Dashboard" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={mainBreadcrumb.path}>
                    {mainBreadcrumb.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="md:hidden flex-1">
        <MobileHeaderContent 
          currentBreadcrumb={mainBreadcrumb} 
          onSelectChange={handleSelectChange}
          currentPath={currentPath}
        />
      </div>

      <div className="hidden md:flex flex-1 justify-center items-center md:justify-end">
        <DesktopHeaderContent 
          currentBreadcrumb={mainBreadcrumb}
          onSelectChange={handleSelectChange}
          currentPath={currentPath}
        />
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