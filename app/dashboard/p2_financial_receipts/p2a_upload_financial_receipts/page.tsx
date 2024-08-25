"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter, FileDown } from 'lucide-react';
import P2S1CardUploadPdfReceipts from '@/components/p2s_financial_receipts/P2S1CardUploadPdfReceipts';
import P2S2UploadedFinancialReceiptTable from '@/components/p2s_financial_receipts/P2S2UploadedFinancialReceiptTable';

const uploadCards = [
  { title: "Orders"},
  { title: "Invoices"},
  { title: "WSK Invoices"},
  { title: "Bank Statements"},
];

export default function P2aUploadFinancialReceipts() {
  const handleUpload = (title: string) => {
    console.log(`Uploading ${title}`);
    // Itt implementálhatjuk később a feltöltési logikát
  };
  return (
    <div className="space-y-4">
            
      <P2S1CardUploadPdfReceipts cards={uploadCards} onUpload={handleUpload} />

    </div>
  );
}
