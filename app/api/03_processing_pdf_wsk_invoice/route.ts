import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/documentProcessing';

export async function POST(req: NextRequest) {
  console.log('WSK Invoices processing endpoint received request');
  return processDocument(req, 'WSK Invoices');
}