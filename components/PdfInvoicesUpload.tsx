// components/PdfInvoicesUpload.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PdfInvoicesUpload() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="invoiceUpload">Upload pdf invoices</Label>
      <Input id="invoiceUpload" type="file" accept="application/pdf" />
    </div>
  );
}
