"use client";

import React from 'react';
import P2S1CardUploadPdfReceipts from '@/components/p2s_financial_receipts/P2S1CardUploadPdfReceipts';

export default function P2aUploadFinancialReceipts() {
  const handleUpload = (title: string) => {
    console.log(`Uploading ${title}`);
  };

  return (
    <div className="space-y-4">
      <P2S1CardUploadPdfReceipts onUploadComplete={handleUpload} />
    </div>
  );
}
