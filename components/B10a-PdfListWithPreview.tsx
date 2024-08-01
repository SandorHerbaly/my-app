import React, { useState, useEffect } from 'react';
import { B10a1PdfListSection } from './B10a1-PdfList-section';
import B10a2PdfPreviewSection from './B10a2-PdfPreview-section';

interface File {
  name: string;
  url: string;
}

interface B10aPdfListWithPreviewProps {
  files: File[];
}

const B10aPdfListWithPreview: React.FC<B10aPdfListWithPreviewProps> = ({ files }) => {
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);

  useEffect(() => {
    if (files && files.length > 0) {
      setSelectedPdf(files[0]);
    }
  }, [files]);

  const handlePdfClick = (pdf: File) => {
    setSelectedPdf(pdf);
  };

  return (
    <div className="flex mt-4">
      <B10a1PdfListSection files={files} onPdfClick={handlePdfClick} selectedPdf={selectedPdf} />
      <B10a2PdfPreviewSection selectedPdf={selectedPdf} />
    </div>
  );
};

export default B10aPdfListWithPreview;