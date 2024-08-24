import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface P2S3PdfViewerDialogProps {
  pdfUrl: string;
  onClose: () => void;
}

const P2S3PdfViewerDialog: React.FC<P2S3PdfViewerDialogProps> = ({ pdfUrl, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>PDF Viewer</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 w-full">
          <object
            data={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
          >
            <p>Unable to display PDF file. <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Download</a> instead.</p>
          </object>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default P2S3PdfViewerDialog;