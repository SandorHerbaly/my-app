'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import B10UploadAndSavePdfInvoices from '@/components/B10-UploadAndSavePdfInvoices';

function InvoicesPage() {
  const router = useRouter();

  const handleClonePreview = (data: any) => {
    const queryParams = new URLSearchParams({ data: JSON.stringify(data) }).toString();
    router.push(`/dashboard/invoices/invoice-preview?${queryParams}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Számlák</h1>
      <B10UploadAndSavePdfInvoices onClonePreview={handleClonePreview} />
    </div>
  );
}

export default InvoicesPage;