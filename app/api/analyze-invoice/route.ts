import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
const serviceAccount = require(process.env.GOOGLE_CLOUD_KEYFILE as string);
if (!initializeApp.length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

const vision = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
});

const storage = getStorage().bucket();

async function getSignedUrl(filename: string): Promise<string> {
  const [url] = await storage.file(filename).getSignedUrl({
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const { filename } = await req.json();
    
    // Get signed URL
    const signedUrl = await getSignedUrl(filename);

    // Analyze PDF with Vision API
    const [result] = await vision.documentTextDetection(signedUrl);
    const fullTextAnnotation = result.fullTextAnnotation;

    return NextResponse.json({ text: fullTextAnnotation?.text });
  } catch (error) {
    console.error("Error analyzing PDF:", error);
    return NextResponse.json({ error: 'Failed to analyze PDF', details: error.message }, { status: 500 });
  }
}
