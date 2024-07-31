'use client';

import React, { useState } from 'react';
import { PdfInvoicesUpload } from '@/components/PdfInvoicesUpload';
import { extractTextFromPDF } from '@/lib/pdfToJsonConverter';
import { storeInvoiceData } from '@/lib/pdfStoreInJson';
import { toast, Toaster } from 'sonner';

function InvoicesPage() {
  const [file, setFile] = useState(null);
  const [json, setJson] = useState(null);

  const handleFileUpload = async (file) => {
    setFile(file);
    setJson(null);  // reset JSON state on new file upload
    console.log("Invoice uploaded");
    try {
      const url = URL.createObjectURL(file);
      const invoiceData = await extractTextFromPDF(url);
      setJson(invoiceData);
      console.log("Invoice data converted to JSON", invoiceData);
      await storeInvoiceData(invoiceData);
      console.log("Invoice saved to Invoices collection");
      toast.success("Invoice saved successfully.");
    } catch (error) {
      toast.error("Failed to save invoice.");
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-1/2 p-4">
        <PdfInvoicesUpload onFileUpload={handleFileUpload} />
      </div>
      <div className="w-1/2 p-4 overflow-auto">
        {json ? (
          <pre>{JSON.stringify(json, null, 2)}</pre>
        ) : (
          <p>No JSON data to display</p>
        )}
      </div>
    </div>
  );
}

export default InvoicesPage;
