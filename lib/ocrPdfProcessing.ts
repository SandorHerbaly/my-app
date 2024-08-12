import { createWorker } from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface ExtractedData {
  invoice_number: string;
  issuer: {
    name: string;
    address: {
      city: string;
      street: string;
      zip: string;
      country: string;
    };
    tax_number: string;
    bank_account: {
      account_number: string;
      bank: string;
    };
  };
  buyer: {
    name: string;
    address: {
      city: string;
      street: string;
      zip: string;
      country: string;
    };
    tax_number: string;
  };
  dates: {
    invoice_date: string;
    performance_date: string;
    payment_due_date: string;
  };
  totals: {
    net_amount: number;
    tax_amount: number;
    gross_amount: number;
  };
}

export async function extractDataFromPdf(pdfUrl: string): Promise<ExtractedData | null> {
  try {
    const pdf = await getDocument(pdfUrl).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context!, viewport }).promise;

    const worker = await createWorker('hun');
    const { data: { text } } = await worker.recognize(canvas.toDataURL('image/png'));
    await worker.terminate();

    return extractDataFromText(text);
  } catch (error) {
    console.error("Error extracting data from PDF:", error);
    return null;
  }
}

function extractDataFromText(text: string): ExtractedData {
  // Ez egy egyszerűsített példa, a valóságban sokkal összetettebb lenne
  return {
    invoice_number: extractInvoiceNumber(text),
    issuer: extractIssuerData(text),
    buyer: extractBuyerData(text),
    dates: extractDates(text),
    totals: extractTotals(text)
  };
}

function extractInvoiceNumber(text: string): string {
  const match = text.match(/SZ[Á|A]MLA SORSZ[Á|A]M[:\s]+(.+)/i);
  return match ? match[1].trim() : "N/A";
}

function extractIssuerData(text: string): ExtractedData['issuer'] {
  const nameMatch = text.match(/KIBOCS[Á|A]T[Ó|O][\s\S]*?([\w\s]+).*?Budapest/i);
  const addressMatch = text.match(/Budapest([\s\S]*?)Magyarorsz[á|a]g/i);
  const taxNumberMatch = text.match(/Ad[ó|o]sz[á|a]m:?\s*(\d{8}-\d-\d{2})/i);
  const bankAccountMatch = text.match(/Banksz[á|a]mla:?\s*([\w\s]+)/i);

  return {
    name: nameMatch ? nameMatch[1].trim() : "N/A",
    address: {
      city: "Budapest",
      street: addressMatch ? addressMatch[1].trim() : "N/A",
      zip: "N/A",
      country: "Magyarország"
    },
    tax_number: taxNumberMatch ? taxNumberMatch[1] : "N/A",
    bank_account: {
      account_number: bankAccountMatch ? bankAccountMatch[1] : "N/A",
      bank: "N/A"
    }
  };
}

function extractBuyerData(text: string): ExtractedData['buyer'] {
  const nameMatch = text.match(/VEV[Ő|O][\s\S]*?([\w\s\.]+)/i);
  const addressMatch = text.match(/VEV[Ő|O][\s\S]*?[\d]{4}([\s\S]*?)Magyarorsz[á|a]g/i);
  const taxNumberMatch = text.match(/Ad[ó|o]sz[á|a]m:?\s*(\d{8}-\d-\d{2})/g);

  return {
    name: nameMatch ? nameMatch[1].trim() : "N/A",
    address: {
      city: "N/A",
      street: addressMatch ? addressMatch[1].trim() : "N/A",
      zip: "N/A",
      country: "Magyarország"
    },
    tax_number: taxNumberMatch && taxNumberMatch.length > 1 ? taxNumberMatch[1] : "N/A"
  };
}

function extractDates(text: string): ExtractedData['dates'] {
  const invoiceDateMatch = text.match(/SZ[Á|A]MLA KELTE:?\s*([\d\.]+)/i);
  const performanceDateMatch = text.match(/TELJES[Í|I]T[É|E]S D[Á|A]TUMA:?\s*([\d\.]+)/i);
  const paymentDueDateMatch = text.match(/FIZET[É|E]SI HAT[Á|A]RID[Ő|O]:?\s*([\d\.]+)/i);

  return {
    invoice_date: invoiceDateMatch ? invoiceDateMatch[1] : "N/A",
    performance_date: performanceDateMatch ? performanceDateMatch[1] : "N/A",
    payment_due_date: paymentDueDateMatch ? paymentDueDateMatch[1] : "N/A"
  };
}

function extractTotals(text: string): ExtractedData['totals'] {
  const netAmountMatch = text.match(/Nett[ó|o] [ö|o]sszeg[\s\S]*?([\d\s]+)/i);
  const grossAmountMatch = text.match(/FIZETEND[Ő|O] [Ö|O]SSZEG[\s\S]*?([\d\s]+)/i);
  
  const netAmount = netAmountMatch ? parseInt(netAmountMatch[1].replace(/\s/g, '')) : 0;
  const grossAmount = grossAmountMatch ? parseInt(grossAmountMatch[1].replace(/\s/g, '')) : 0;
  
  return {
    net_amount: netAmount,
    tax_amount: grossAmount - netAmount,
    gross_amount: grossAmount
  };
}