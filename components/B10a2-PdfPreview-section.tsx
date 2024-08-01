import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const PdfPreviewSection = ({ selectedPdf }) => {
  return (
    <div className="w-3/4 p-4 overflow-auto ">
      {selectedPdf ? (
        <div style={{ height: '100%', width: '100%' }}>
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
            <Viewer fileUrl={selectedPdf.url} />
          </Worker>
        </div>
      ) : (
        <p>No PDF selected</p>
      )}
    </div>
  );
};

export default PdfPreviewSection;
