import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import PdfViewer from '@/components/PdfViewer';
import { toast } from 'sonner';

export function PdfListWithPreview() {
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
      <div className="w-1/4 p-4 overflow-auto border-r">
        <h3 className="text-lg font-medium">Uploaded PDF Invoices</h3>
        <ul>
          {pdfFiles.map((file, index) => (
            <li key={index} className="my-2">
              <button
                className={`block w-full text-left px-4 py-2 rounded ${
                  selectedPdf && selectedPdf.name === file.name ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => handlePdfClick(file)}
              >
                {file.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 p-4 overflow-auto">
        {selectedPdf ? (
          <PdfViewer file={selectedPdf} />
        ) : (
          <p>No PDF selected</p>
        )}
      </div>
    </div>
  );
}

