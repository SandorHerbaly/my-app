import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

console.log('Starting analyze-invoice route');

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

const firestore = admin.firestore();

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
    const { pdf_filename, type } = await req.json();
    console.log(`Processing file: ${pdf_filename} of type: ${type}`);

    // Dinamikusan állítsuk be a gyűjtemény nevét a típus alapján
    let collectionName = '';
    switch (type) {
      case 'Invoices':
        collectionName = 'UploadedPdfInvoices';
        break;
      case 'Orders':
        collectionName = 'UploadedPdfOrders';
        break;
      case 'WSK Invoices':
        collectionName = 'UploadedWskInvoices';
        break;
      case 'Bank Statements':
        collectionName = 'UploadedBankStatements';
        break;
      default:
        throw new Error('Unknown file type');
    }

    const file = storage.file(`${collectionName}/${pdf_filename}`);
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File not found: ${collectionName}/${pdf_filename}`);
    }

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    console.log(`File downloaded, buffer length: ${buffer.byteLength}`);

    let dataToSend: string;
    let mimeType: string;

    if (pdf_filename.endsWith('.pdf')) {
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
      {
        text: `
          Extract the full text content from the provided order document. 
          Then, fill the following JSON template with the extracted data:
      
          {
            "[o-001] pdf-text": "Full extracted text goes here",
            "rendeles": {
              "[o-01] rendeles_szam": "A 'Rendelés #' utáni karakterlánc",
              "[o-02] rendeles_datum": "A 'Rendelés dátuma:' melletti dátum",
              "[o-03] ertekesito": "Az 'Értékesítő:' melletti név"
            },
            "kibocsato": {
              "[o-04] cegnev": "",
              "cim": {
                "[o-05] utca_hsz": "",
                "[o-06] telepules": "",
                "[o-07] iranyitoszam": "",
                "[o-08] orszag": ""
              }
            },
            "vevo": {
              "[o-09] cegnev": "",
              "szamlazasi_cim": {
                "[o-10] utca_hsz": "",
                "[o-11] telepules": "",
                "[o-12] iranyitoszam": "",
                "[o-13] orszag": ""
              },
              "szallitasi_cim": {
                "[o-14] utca_hsz": "",
                "[o-15] telepules": "",
                "[o-16] iranyitoszam": "",
                "[o-17] orszag": ""
              },
              "[o-18] telefon": ""
            },
            "tetel": [
              {
                "tetel-sor": 1,
                "termek-tetel": {
                  "[o-19] I6_cikkszam": "A leírás kapcsos zárójelekkel jelölt része",
                  "[o-20] termek_megnevezes": "A leírás a ']' kapcsos zárójel utáni szöveges rész",
                  "termek-csoport": "A termék megnevezésből kell meghatározni. Ha a megnevezésben szerepel a DJI szó, akkor a termékcsoport DJI, ha a Roborock szó van a termék megnevezésben, akkor Roborock legyen a termékcsoport neve",
                  "[o-21] Cikkszam": "A 'Cikkszám:' utáni karakterlánc",
                  "[o-22] EAN": "Az 'EAN:' utáni számsor",
                  "[o-23] tetel_mennyiseg": "",
                  "[o-24] tetel_egysegar": "",
                  "[o-25] tetel_ado_mertek": "...%",
                  "[o-26] tetel_amount": ""
                }
              }
            ],
            "osszegek": {
              "[o-27] netto_osszeg": "",
              "[o-28] afa_osszeg": "",
              "[o-29] brutto_osszeg": ""
            },
            "[o-30] fizetesi_feltetelek": "A 'Payment terms:' utáni szöveg",
            "szamla_lablec": {
              "elerhetoseg": {
                "[o-31] honlap": "",
                "[o-32] email": "",
                "[o-33] telefon": ""
              }
            }
          }
      
          Return the filled JSON template with the extracted data from the provided order document.
          Note: The 'tetel' array should contain all product items found in the order. Repeat the 'termek-tetel' structure for each item, incrementing the 'tetel-sor' number.
        `
      }
      
      
      
    ]);

    console.log('Received response from Gemini');
    let generatedJson = result.response.text();

    generatedJson = generatedJson
      .replace(/^\s*```json\s*/, '')
      .replace(/\s*```\s*$/, '')
      .replace(/\n/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/,(?=\s*})/g, '')
      .trim();

    try {
      const parsedJson = JSON.parse(generatedJson);
      console.log('Gemini elemzés eredménye:', JSON.stringify(parsedJson, null, 2));

      const ai_json_filename = `AI_${pdf_filename.replace('.pdf', '.json')}`;
      const docRef = firestore.collection('AI-Invoices').doc(ai_json_filename);
      await docRef.set(parsedJson);
      console.log(`AI elemzés eredménye elmentve: ${ai_json_filename}`);

      // EventLog bejegyzés
      const eventLogRef = await firestore.collection('EventLog').add({
        action: 'analyse document',
        fileName: pdf_filename,
        aiFileName: ai_json_filename,
        collection: 'AI-Invoices',
        analysedBy: 'Emily Parker',
        analysedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`EventLog bejegyzés létrehozva: ${eventLogRef.id}`);

      return NextResponse.json({ 
        text: JSON.stringify(parsedJson), 
        ai_json_filename,
        eventLogId: eventLogRef.id
      });
    } catch (error) {
      console.error('Error processing invoice:', error.message);
      return NextResponse.json({ error: 'Failed to analyze invoice', details: error.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing invoice:', error.message);
    return NextResponse.json({ error: 'Failed to analyze invoice', details: error.message }, { status: 500 });
  }
}

