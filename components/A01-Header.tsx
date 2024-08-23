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
  { href: "/dashboard/p1_orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/p2_invoices", label: "Invoices", icon: FileText },
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
  "/dashboard/p2_invoices": {
    title: "Invoices",
    path: "/dashboard/p2_invoices",
    submenu: [
      { label: "Upload pdf invoices", path: "/dashboard/p2_invoices/p2a_upload_pdf_invoices" },
      { label: "Create Invoice", path: "/dashboard/p2_invoices/p2b_create_invoice" },
      { label: "Pending Invoices", path: "/dashboard/p2_invoices/p2c_pending_invoices" },
      { label: "Paid Invoices", path: "/dashboard/p2_invoices/p2d_paid_invoices" },
      { label: "Invoice Reports", path: "/dashboard/p2_invoices/p2e_invoice_reports" },
    ],
  },
  "/dashboard/p3_transfers": {
    title: "Transfers",
    path: "/dashboard/p3_transfers",
    submenu: [
      { label: "Internal Transfers", path: "/dashboard/p3_transfers/p3a_internal_transfers" },
      { label: "External Transfers", path: "/dashboard/p3_transfers/p3b_external_transfers" },
      { label: "Transfer History", path: "/dashboard/p3_transfers/p3c_transfer_history" },
      { label: "Scheduled Transfers", path: "/dashboard/p3_transfers/p3d_scheduled_transfers" },
      { label: "Transfer Reports", path: "/dashboard/p3_transfers/p3e_transfer_reports" },
    ],
  },
  "/dashboard/p4_products": {
    title: "Products",
    path: "/dashboard/p4_products",
    submenu: [
      { label: "Product List", path: "/dashboard/p4_products/p4a_product_list" },
      { label: "Add New Product", path: "/dashboard/p4_products/p4b_add_new_product" },
      { label: "Edit Product", path: "/dashboard/p4_products/p4c_edit_product" },
      { label: "Inventory", path: "/dashboard/p4_products/p4d_inventory" },
      { label: "Product Reviews", path: "/dashboard/p4_products/p4e_product_reviews" },
    ],
  },
  "/dashboard/p5_customers": {
    title: "Customers",
    path: "/dashboard/p5_customers",
    submenu: [
      { label: "Customer List", path: "/dashboard/p5_customers/p5a_customer_list" },
      { label: "Add New Customer", path: "/dashboard/p5_customers/p5b_add_new_customer" },
      { label: "Customer Segments", path: "/dashboard/p5_customers/p5c_customer_segments" },
      { label: "Customer Feedback", path: "/dashboard/p5_customers/p5d_customer_feedback" },
      { label: "VIP Customers", path: "/dashboard/p5_customers/p5e_VIP_customers" },
    ],
  },
  "/dashboard/p6_analytics": {
    title: "Analytics",
    path: "/dashboard/p6_analytics",
    submenu: [
      { label: "Overview", path: "/dashboard/p6_analytics/p6a_overview" },
      { label: "Sales Reports", path: "/dashboard/p6_analytics/p6b_sales_reports" },
      { label: "Customer Insights", path: "/dashboard/p6_analytics/p6c_customer_insights" },
      { label: "Product Performance", path: "/dashboard/p6_analytics/p6d_product_performance" },
      { label: "Custom Reports", path: "/dashboard/p6_analytics/p6e_custom_reports" },
    ],
  },
  "/dashboard/p7_tables": {
    title: "Tables",
    path: "/dashboard/p7_tables",
    submenu: [
      { label: "Table List", path: "/dashboard/p7_tables/p7a_table_list" },
      { label: "Create Table", path: "/dashboard/p7_tables/p7b_create_table" },
      { label: "Table Settings", path: "/dashboard/p7_tables/p7c_table_settings" },
      { label: "Table Reports", path: "/dashboard/p7_tables/p7d_table_reports" },
      { label: "Custom Tables", path: "/dashboard/p7_tables/p7e_custom_tables" },
    ],
  },
  "/dashboard/p8_settings": {
    title: "Settings",
    path: "/dashboard/p8_settings",
    submenu: [
      { label: "General Settings", path: "/dashboard/p8_settings/p8a_general_settings" },
      { label: "User Management", path: "/dashboard/p8_settings/p8b_user_management" },
      { label: "Payment Settings", path: "/dashboard/p8_settings/p8c_payment_settings" },
      { label: "Notification Settings", path: "/dashboard/p8_settings/p8d_notification_settings" },
      { label: "Integrations", path: "/dashboard/p8_settings/p8e_integrations" },
    ],
  },
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
            {subPageTitle && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={pathname}>{subPageTitle}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Mobilnézet: Select komponens */}
      <div className="md:hidden flex-1">
        <MobileHeaderContent 
          currentBreadcrumb={mainBreadcrumb} 
          onSelectChange={handleSelectChange}
          currentPath={currentPath}
        />
      </div>

      {/* Desktop és tablet nézet: Stílusozott Select komponens */}
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