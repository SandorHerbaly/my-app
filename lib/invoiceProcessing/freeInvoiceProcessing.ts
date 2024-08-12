import { getDocument } from 'pdfjs-dist';

export async function processInvoice(pdfUrl: string) {
  const text = await extractTextFromPdf(pdfUrl);
  return extractStructuredData(text);
}

async function extractTextFromPdf(pdfUrl: string): Promise<string> {
  const pdf = await getDocument(pdfUrl).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
}

function extractStructuredData(text: string) {
  return {
    invoice_number: extractInvoiceNumber(text),
    issuer: extractIssuerData(text),
    buyer: extractBuyerData(text),
    dates: extractDates(text),
    totals: extractTotals(text),
  };
}

function extractInvoiceNumber(text: string): string {
  const match = text.match(/Számla\s+(INV\/\d{4}\/\d{5})/i);
  return match ? match[1] : 'N/A';
}

function extractIssuerData(text: string) {
  const nameMatch = text.match(/KIBOCSÁTÓ\s+([\s\S]*?)(?=\n)/);
  const addressMatch = text.match(/KIBOCSÁTÓ[\s\S]*?([\s\S]*?)(?=Adószám)/);
  const taxNumberMatch = text.match(/Adószám:\s*(\d{8}-\d-\d{2})/);
  const bankAccountMatch = text.match(/Bankszámla:\s*([\s\S]*?)(?=\n)/);

  return {
    name: nameMatch ? nameMatch[1].trim() : 'N/A',
    address: addressMatch ? addressMatch[1].trim().replace(/\n/g, ', ') : 'N/A',
    tax_number: taxNumberMatch ? taxNumberMatch[1] : 'N/A',
    bank_account: bankAccountMatch ? bankAccountMatch[1].trim() : 'N/A'
  };
}

function extractBuyerData(text: string) {
  const nameMatch = text.match(/VEVŐ\s+([\s\S]*?)(?=\n)/);
  const addressMatch = text.match(/VEVŐ[\s\S]*?([\s\S]*?)(?=Adószám)/);
  const taxNumberMatch = text.match(/Adószám:\s*(\d{8}-\d-\d{2})/g);

  return {
    name: nameMatch ? nameMatch[1].trim() : 'N/A',
    address: addressMatch ? addressMatch[1].trim().replace(/\n/g, ', ') : 'N/A',
    tax_number: taxNumberMatch && taxNumberMatch.length > 1 ? taxNumberMatch[1].split(': ')[1] : 'N/A'
  };
}

function extractDates(text: string) {
  const invoiceDateMatch = text.match(/SZÁMLA KELTE:\s*(\d{4}-\d{2}-\d{2})/);
  const performanceDateMatch = text.match(/TELJESÍTÉS DÁTUMA:\s*(\d{4}-\d{2}-\d{2})/);
  const paymentDueDateMatch = text.match(/FIZETÉSI HATÁRIDŐ:\s*(\d{4}-\d{2}-\d{2})/);

  return {
    invoice_date: invoiceDateMatch ? invoiceDateMatch[1] : 'N/A',
    performance_date: performanceDateMatch ? performanceDateMatch[1] : 'N/A',
    payment_due_date: paymentDueDateMatch ? paymentDueDateMatch[1] : 'N/A'
  };
}

function extractTotals(text: string) {
  const netAmountMatch = text.match(/Nettó összeg\s*([\d\s]+)\s*Ft/);
  const grossAmountMatch = text.match(/FIZETENDŐ ÖSSZEG\s*([\d\s]+)\s*Ft/);
  
  const netAmount = netAmountMatch ? parseInt(netAmountMatch[1].replace(/\s/g, '')) : 0;
  const grossAmount = grossAmountMatch ? parseInt(grossAmountMatch[1].replace(/\s/g, '')) : 0;
  
  return {
    net_amount: netAmount,
    tax_amount: grossAmount - netAmount,
    gross_amount: grossAmount
  };
}