import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import PdfListSection from '@/components/B10a1-PdfList-section';
import PdfPreviewSection from '@/components/B10a2-PdfPreview-section';

const PdfListWithPreview = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    const fetchPdfFiles = async () => {
      const storageRef = ref(storage, 'invoices');
      const result = await listAll(storageRef);
      const files = await Promise.all(result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      }));
      setPdfFiles(files);
      if (files.length > 0) {
        setSelectedPdf(files[0]); // Set the first PDF as the default selected
      }
    };

    fetchPdfFiles();
  }, []);

  const handlePdfClick = (pdf) => {
    setSelectedPdf(pdf);
  };

  return (
    <div className="flex h-screen">
      <PdfListSection pdfFiles={pdfFiles} handlePdfClick={handlePdfClick} selectedPdf={selectedPdf} />
      <PdfPreviewSection selectedPdf={selectedPdf} />
    </div>
  );
};

export default PdfListWithPreview;
