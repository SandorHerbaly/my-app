import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface P2S3PdfViewerDialogProps {
  pdfUrl: string;
  onClose: () => void;
}

const P2S3PdfViewerDialog: React.FC<P2S3PdfViewerDialogProps> = ({ pdfUrl, onClose }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPdfAvailability = async () => {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error('PDF not found or inaccessible');
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setLoading(false);
      }
    };

    checkPdfAvailability();
  }, [pdfUrl]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-4 bg-white">
          <DialogTitle>PDF Viewer</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden relative bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading PDF...</p>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none"
              title="PDF Viewer"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default P2S3PdfViewerDialog;