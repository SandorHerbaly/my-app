import React from 'react';
import { P1S1CardOrder } from "@/components/p1s_orders/P1S1CardOrder";
import { P1S2CardStats } from "@/components/p1s_orders/P1S2CardStats";
import { P1S3OrderTable } from "@/components/p1s_orders/P1S3OrderTable";
import { P1S4OrderDetails } from "@/components/p1s_orders/P1S4OrderDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ListFilter, File } from "lucide-react";

export default function P1Orders() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 grid-cols-1">
      {/* Main content area */}
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
        {/* P1S1 and P1S2 components */}
        <div className="grid gap-4 sm:grid-cols-2 grid-cols-1">
          <div className="sm:col-span-2">
            <P1S1CardOrder />
          </div>
          <P1S2CardStats
            title="This Week"
            amount="$1,329"
            description="+25% from last week"
            value={25}
          />
          <P1S2CardStats
            title="This Month"
            amount="$5,329"
            description="+10% from last month"
            value={10}
          />
        </div>
        
        {/* Tabs and P1S3 component */}
        <Tabs defaultValue="week">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  >
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Fulfilled
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>
                    Declined
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>
                    Refunded
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-xs"
              >
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Export</span>
              </Button>
            </div>
          </div>
          <TabsContent value="week">
            <P1S3OrderTable />
          </TabsContent>
        </Tabs>
      </div>

      {/* P1S4 component */}
      <div className="lg:col-start-3 lg:row-start-1 mt-4 lg:mt-0">
        <P1S4OrderDetails />
      </div>
    </div>
  );
}
