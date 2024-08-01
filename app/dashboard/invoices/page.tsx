'use client';

import React from 'react';
import B10UploadAndSavePdfInvoices from '@/components/B10-UploadAndSavePdfInvoices';

function InvoicesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>
      <B10UploadAndSavePdfInvoices />
    </div>
  );
}

export default InvoicesPage;