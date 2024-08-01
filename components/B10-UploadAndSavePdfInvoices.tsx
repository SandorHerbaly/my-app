import React, { useState } from 'react';
import { storage } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { toast, Toaster } from 'sonner';
import { extractTextFromPDF } from '@/lib/pdfToJsonConverter';
import { storeInvoiceData } from '@/lib/pdfStoreInJson';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const PdfFileUploader = ({ onUpload }) => {
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const uploadedFiles = await Promise.all(files.map(async (file) => {
      const storageRef = ref(storage, 'invoices/' + file.name);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      toast.success(`File ${file.name} uploaded successfully.`);
      return { name: file.name, url };
    }));
    onUpload(uploadedFiles);
  };

  return (
    <input type="file" multiple onChange={handleFileUpload} />
  );
};

const PdfListWithPreview = ({ files, onPdfClick }) => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 overflow-auto border-r">
        <h3 className="text-lg font-medium">Uploaded PDF Invoices</h3>
        <ul>
          {files.map((file, index) => (
            <li key={index} className="my-2">
              <button
                className={`block w-full text-left px-4 py-2 rounded ${
                  file.selected ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => onPdfClick(file)}
              >
                {file.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 p-4 overflow-auto">
        {files.some(file => file.selected) ? (
          <div style={{ height: '100%', width: '100%' }}>
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
              <Viewer fileUrl={files.find(file => file.selected).url} />
            </Worker>
          </div>
        ) : (
          <p>No PDF selected</p>
        )}
      </div>
    </div>
  );
};

const B10UploadAndSavePdfInvoices = () => {
  const [files, setFiles] = useState([]);
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = (uploadedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };

  const handleDataExtraction = async () => {
    try {
      const extractedDataPromises = files.map(async (file) => {
        const invoiceData = await extractTextFromPDF(file.url);
        await storeInvoiceData(invoiceData);
        return invoiceData;
      });

      const extractedData = await Promise.all(extractedDataPromises);
      setJsonData(extractedData);
      toast.success("Data extracted and saved successfully.");
    } catch (error) {
      toast.error("Failed to extract data.");
      console.error(error);
    }
  };

  const handlePdfClick = (clickedFile) => {
    setFiles(files.map(file => ({
      ...file,
      selected: file.name === clickedFile.name,
    })));
  };

  return (
    <div className="flex h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-1/4 p-4">
        <h2 className="text-lg font-bold mb-4">Upload PDF Invoices</h2>
        <PdfFileUploader onUpload={handleFileUpload} />
        <button onClick={handleDataExtraction} className="mt-4 p-2 bg-blue-500 text-white rounded">
          Extract & Save Data
        </button>
      </div>
      <div className="w-3/4 p-4 overflow-auto">
        <PdfListWithPreview files={files} onPdfClick={handlePdfClick} />
        {jsonData && (
          <div className="mt-4">
            <h2 className="text-lg font-bold mb-4">Extracted JSON Data</h2>
            <pre>{JSON.stringify(jsonData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default B10UploadAndSavePdfInvoices;
