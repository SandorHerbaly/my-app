import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

console.log('Starting analyze-invoice route');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  console.log('Initializing Firebase Admin');
  try {
    const serviceAccountPath = path.join(process.cwd(), 'credentials', 'Firebase-SA-key.json');
    console.log('Service account path:', serviceAccountPath);
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log('Firebase Admin initialized successfully');
    console.log('Storage bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

// Initialize Gemini API
console.log('Initializing GoogleGenerativeAI');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

console.log('Getting Firebase Storage bucket');
const storage = getStorage().bucket();

console.log('Initializing Gemini model');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  console.log('Received analyze-invoice POST request');
  try {
    const { filename } = await req.json();
    console.log(`Processing file: ${filename}`);

    // Get temporary public URL for the file
    console.log('Getting temporary public URL for the file');
    console.log(`Full path: invoices/${filename}`);
    const file = storage.file(`invoices/${filename}`);
    const [exists] = await file.exists();
    console.log('File exists:', exists);

    if (!exists) {
      throw new Error(`File not found: invoices/${filename}`);
    }

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    console.log(`Generated temporary public URL for ${filename}: ${url}`);

    console.log(`Downloading file from Firebase Storage: ${filename}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    console.log(`File downloaded, buffer length: ${buffer.byteLength}`);

    let dataToSend: string;
    let mimeType: string;

    if (filename.endsWith('.pdf')) {
      mimeType = 'application/pdf';
      dataToSend = Buffer.from(buffer).toString('base64');
    } else { 
      mimeType = 'image/png';
      dataToSend = Buffer.from(buffer).toString('base64');
    }

    console.log('Sending request to Gemini');
    const result = await model.generateContent([
      {
        inlineData: {
          data: dataToSend,
          mimeType: mimeType
        }
      },
      { text: 'Kérlek, generálj egy JSON-t a számla adataival a következő formátumban: {"szamla_szam": ...}' }
    ]);

    console.log('Received response from Gemini');
    let generatedJson = result.response.text();

    // Tisztítsuk meg és javítsuk a JSON-t
    generatedJson = generatedJson
      .replace(/^\s*```json\s*/, '')  // Eltávolítjuk a kezdő ```json jelölést, ha van
      .replace(/\s*```\s*$/, '')      // Eltávolítjuk a záró ``` jelölést, ha van
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Idézőjelbe tesszük a kulcsokat
      .replace(/'/g, '"')  // Egyszeres idézőjeleket cseréljük dupla idézőjelekre
      .replace(/,\s*}/g, '}')  // Eltávolítjuk a felesleges vesszőket az objektumok végéről
      .trim();

    try {
      // Ellenőrizzük, hogy érvényes JSON-e
      const parsedJson = JSON.parse(generatedJson);
      console.log('Valid JSON generated:');
      console.log(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      console.error('Invalid JSON generated. Raw response:');
      console.log(generatedJson);
      throw new Error('Invalid JSON generated');
    }

    return NextResponse.json({ text: generatedJson });
  } catch (error) {
    console.error("Error analyzing invoice:", error);
    return NextResponse.json({ error: 'Failed to analyze invoice', details: error.message }, { status: 500 });
  }
}