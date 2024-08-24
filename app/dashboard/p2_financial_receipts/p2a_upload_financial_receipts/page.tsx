"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter, FileDown } from 'lucide-react';
import P2S1CardUploadPdfReceipts from '@/components/p2s_financial_receipts/P2S1CardUploadPdfReceipts';
import P2S2UploadedFinancialReceuptTable from '@/components/p2s_financial_receipts/P2S2UploadedFinancialReceuptTable';

const uploadCards = [
  { title: "Orders", count: 474, lastUpload: "Friday, August 23, 2024, 3:55 PM" },
  { title: "Invoices", count: 485, lastUpload: "Friday, August 23, 2024, 3:55 PM" },
  { title: "WSK Invoices", count: 476, lastUpload: "Friday, August 23, 2024, 3:55 PM" },
  { title: "Bank Statements", count: 148, lastUpload: "Friday, August 23, 2024, 3:55 PM" },
];

const tableData = [
  { filename: "INV_2024_01273.pdf", type: "Invoice", aiStatus: "Not analysed", uploaded: "Friday, August 23, 2024, 3:55 PM, Emily Parker" },
  { filename: "PRO-FORMA - 502336.pdf", type: "WSK Invoice", aiStatus: "Not Analysed", uploaded: "Friday, August 23, 2024, 3:55 PM, Emily Parker" },
  { filename: "Order - 502336.pdf", type: "Order", aiStatus: "Analysed", uploaded: "Friday, August 23, 2024, 3:55 PM, Emily Parker" },
  { filename: "INV_2024_01505.pdf", type: "Invoice", aiStatus: "Not Analysed", uploaded: "Friday, August 23, 2024, 3:55 PM, Emily Parker" },
  { filename: "20240531_021624FBT5100.pdf", type: "Bank Statements", aiStatus: "Analysed", uploaded: "Friday, August 23, 2024, 3:55 PM, Emily Parker" },
  { filename: "S02344.pdf", type: "Order", aiStatus: "Analysed", uploaded: "Friday, August 23, 2024, 3:55 PM, Emily Parker" },
];

export default function P2aUploadFinancialReceipts() {
  const handleUpload = (title: string) => {
    console.log(`Uploading ${title}`);
    // Itt implementálhatjuk később a feltöltési logikát
  };

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Upload Financial Receipts</h2>
      
      <P2S1CardUploadPdfReceipts cards={uploadCards} onUpload={handleUpload} />

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="proforma">Pro-Forma Invoices</TabsTrigger>
            <TabsTrigger value="bankstatements">Bank Statements</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Type</DropdownMenuItem>
                <DropdownMenuItem>AI Status</DropdownMenuItem>
                <DropdownMenuItem>Upload Date</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <P2S2UploadedFinancialReceuptTable 
            title="All Uploaded PDF receipts (1583)"
            description="Last upload: Friday, August 23, 2024, 3:55 PM"
            data={tableData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
