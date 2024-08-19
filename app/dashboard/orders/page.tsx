"use client"

import React from 'react';
import { B11aCardOrder } from "@/components/B11a-CardOrder";
import { B11bCardStats } from "@/components/B11b-CardStats";
import { B11cOrderTable } from "@/components/B11c-OrderTable";
import { B11dOrderDetails } from "@/components/B11d-OrderDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ListFilter, File } from "lucide-react";

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

interface OrdersPageProps {
  viewportSize: ViewportSize;
}

export default function OrdersPage({ viewportSize }: OrdersPageProps) {
  return (
    <div className={`grid gap-4 ${viewportSize === 'desktop' ? 'lg:grid-cols-3 xl:grid-cols-3' : 'grid-cols-1'}`}>
      <div className={`grid auto-rows-max items-start gap-4 ${viewportSize === 'desktop' ? 'lg:col-span-2' : ''}`}>
        <div className={`grid gap-4 ${viewportSize === 'mobile' ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
          <div className={viewportSize === 'mobile' ? '' : 'sm:col-span-2'}>
            <B11aCardOrder />
          </div>
          <B11bCardStats
            title="This Week"
            amount="$1,329"
            description="+25% from last week"
            value={25}
          />
          <B11bCardStats
            title="This Month"
            amount="$5,329"
            description="+10% from last month"
            value={10}
          />
        </div>
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
            <B11cOrderTable />
          </TabsContent>
        </Tabs>
      </div>
      <div className={viewportSize === 'desktop' ? 'col-span-1' : 'mt-4'}>
        <B11dOrderDetails />
      </div>
    </div>
  );
}