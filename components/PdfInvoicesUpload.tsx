'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PdfViewer from "@/components/PdfViewer";
import { toast } from 'sonner';

export function PdfInvoicesUpload({ onFileUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      toast.success("PDF invoice uploaded successfully.");
      onFileUpload(file);
    } else {
      setDialogMessage("Please select a PDF file.");
      setShowDialog(true);
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="invoiceUpload">Upload pdf invoices</Label>
      <Input id="invoiceUpload" name="invoiceUpload" type="file" accept="application/pdf" onChange={handleFileChange} />
      {selectedFile && (
        <div className="mt-4" style={{ height: '70vh' }}>
          <PdfViewer file={selectedFile} />
        </div>
      )}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p>{dialogMessage}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
