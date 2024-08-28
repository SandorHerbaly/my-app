'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
//import B10UploadAndSavePdfInvoices from '@/components/B10-UploadAndSavePdfInvoices';
import B12AssignInvoiceData from '@/components/B12-AssignInvoiceData'; 

function InvoicesPage() {
  const router = useRouter();

  const handleClonePreview = (data: any) => {
    router.push(`/dashboard/invoices/assign-invoice-data?data=${JSON.stringify(data)}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Számlák</h1>
      <B10UploadAndSavePdfInvoices onClonePreview={handleClonePreview} /> 
      {/* A B12AssignInvoiceData komponensnek a data objektumot nem kell átadni, mert a query paraméterben kapja */}
      <B12AssignInvoiceData /> 
    </div>
  );
}

export default InvoicesPage;