// app/dashboard/invoices/page.tsx
import React from 'react';
import { PdfInvoicesUpload } from '@/components/PdfInvoicesUpload';

function InvoicesPage() {
  return (
    <div>  
      <PdfInvoicesUpload />
    </div>
  );
}

export default InvoicesPage;
