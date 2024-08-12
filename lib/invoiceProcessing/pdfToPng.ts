// lib/pdfToPng.ts

import * as pdfjs from 'pdfjs-dist';

// Inicializáld a pdf.js worker-t
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function convertPdfToPng(pdfFile: File): Promise<string[]> {
  const pdfData = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
  const pngUrls: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Unable to create canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    const pngUrl = canvas.toDataURL('image/png');
    pngUrls.push(pngUrl);
  }

  return pngUrls;
}