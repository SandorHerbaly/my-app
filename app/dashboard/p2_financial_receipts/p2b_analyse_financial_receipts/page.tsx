"use client";

import React from 'react';
import P2bS1CardAnalysePdfReceipts from '@/components/p2s_financial_receipts/P2bS1CardAnalysePdfReceipts';


const uploadCards = [
  { title: "Orders"},
  { title: "Invoices"},
  { title: "WSK Invoices"},
  { title: "Bank Statements"},
];

export default function P2bAnalyseFinancialReceipts() {
  const handleUpload = (title: string) => {
    console.log(`Uploading ${title}`);
  };
  return (
    <div className="space-y-4">
            
      <P2bS1CardAnalysePdfReceipts cards={uploadCards} onUpload={handleUpload} />

    </div>
  );
}

