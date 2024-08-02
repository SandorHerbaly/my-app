import { PDFDocument } from 'pdf-lib';

export const extractTextFromPDF = async (pdfUrl) => {
  try {
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Placeholder szöveg helyett tényleges szöveg kinyerés (helyettesítendő a valódi implementációval)
    const text = "PDF tartalom placeholder";

    // Regex segítségével adat kinyerés (példa regex, testreszabás szükséges)
    const invoiceNumberMatch = text.match(/Számla száma:\s*(\S+)/);
    const issuerNameMatch = text.match(/Kibocsátó:\s*(.+)/);
    const taxNumberMatch = text.match(/Adószám:\s*(\d+)/);

    const invoiceData = {
      szamla_szam: invoiceNumberMatch ? invoiceNumberMatch[1] : '',
      kibocsato: {
        cegnev: issuerNameMatch ? issuerNameMatch[1] : '',
        adoszam: taxNumberMatch ? taxNumberMatch[1] : '',
        // További mezők hasonlóan...
      },
      // További mezők hasonlóan...
    };

    console.log("PDF szöveg kinyerés kész:", text);
    console.log("Kinyert adatok:", invoiceData);

    return invoiceData;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return null;
  }
};
