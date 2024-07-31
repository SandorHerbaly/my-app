// lib/pdfToJsonConverter.js
import { PDFDocument } from 'pdf-lib';

export const extractTextFromPDF = async (pdfUrl) => {
  const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const text = await pages[0].getTextContent(); // Get text content in a different way

  // Itt dolgozd fel a text változót és nyerj ki belőle adatokat
  const invoiceData = {
    number: 'INV/2024/01272',
    date: '2024-06-28',
    customer: 'Dronesys Kft',
    amount: 8650133,
    // Add meg a szükséges adatokat
  };

  return invoiceData;
};
