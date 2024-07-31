// components/FileUploader/PdfFileUploader.tsx
import React from 'react';
import { storage } from '../../lib/firebase.config';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { extractTextFromPDF } from '../../lib/pdfToJsonConverter';
import { storeInvoiceData } from '../../lib/pdfStoreInJson';

const PdfFileUploader = () => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, 'invoices/' + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    console.log('File available at', url);

    // Process the PDF and store the data in Firestore
    const invoiceData = await extractTextFromPDF(url);
    await storeInvoiceData(invoiceData);
  };

  return (
    <input type="file" onChange={handleFileUpload} />
  );
};

export default PdfFileUploader;
