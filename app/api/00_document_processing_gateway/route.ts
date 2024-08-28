import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { documentType, filename } = await req.json();
    console.log(`Gateway received document: ${filename} of type ${documentType}`);

    let processingEndpoint;
    switch (documentType) {
      case 'Orders':
        processingEndpoint = '/api/01_processing_pdf_order';
        break;
      case 'Invoices':
        processingEndpoint = '/api/02_processing_pdf_invoice';
        break;
      case 'WSK Invoices':
        processingEndpoint = '/api/03_processing_pdf_wsk_invoice';
        break;
      case 'Bank Statements':
        processingEndpoint = '/api/04_processing_pdf_bank_statement';
        break;
      default:
        throw new Error('Invalid document type');
    }

    console.log(`Forwarding ${filename} to ${processingEndpoint}`);

    const response = await fetch(`${req.nextUrl.origin}${processingEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
      throw new Error(`Processing failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Gateway received response for ${filename}, forwarding to client`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in gateway:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}