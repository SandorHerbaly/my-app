import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface PdfPreviewSectionProps {
  selectedPdf: { url: string } | null;
}

const B10a2PdfPreviewSection: React.FC<PdfPreviewSectionProps> = ({ selectedPdf }) => {
  return (
    <div className="h-[600px]">
      <h3 className="text-lg font-medium mb-4">PDF Preview</h3>
      {selectedPdf ? (
        <div className="h-[calc(100%-2rem)]">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
            <Viewer fileUrl={selectedPdf.url} />
          </Worker>
        </div>
      ) : (
        <div className="h-[calc(100%-2rem)] flex items-center justify-center text-muted-foreground">
          No PDF selected
        </div>
      )}
    </div>
  );
};

export default B10a2PdfPreviewSection;