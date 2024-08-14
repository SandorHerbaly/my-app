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

// Initialize Firestore
const firestore = admin.firestore();

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

    const file = storage.file(`invoices/${filename}`);
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File not found: invoices/${filename}`);
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
      { 
        text: `
          I have the following JSON template that I want you to fill with data extracted from the provided invoice document. Please extract the required fields as described in the template. If you cannot extract a particular field, please leave it empty or mark it as "N/A". Continue with the next field without stopping if any errors occur:

          {
            "szamla_szam": {
              "[f-01] szla_prefix": "",
              "[f-02] szla_year": "",
              "[f-03] ODU_szamlaszam": "",
              "[f-00] penznem": "HUF"  
            },
            "kibocsato": {
              "[f-04] cegnev": "",
              "cim": {
                "[f-08] orszag": "",
                "[f-05] telepules": "",
                "[f-07] iranyitoszam": "",
                "[f-06] utca_hsz": ""
              },
              "[f-09] adoszam": "",
              "bankszamla": {
                "[f-10] szamlaszam": "",
                "[f-11] bank": ""
              },
              "[f-19] ODU_rendeles_szam": "A Forrás alatti két karakterlánc első S betűvel kezdődő része",
              "[f-20] I6_rendeles_szam": "A Forrás második COR prefixel kezdődő része",
              "[f-21] I6_szamlaszam": "A referencia alatti azonosító szám"
            },
            "vevo": {
              "[f-12] cegnev": "",
              "cim": {
                "[f-16] orszag": "",
                "[f-13] telepules": "",
                "[f-15] iranyitoszam": "",
                "[f-14] utca_hsz": ""
              },
              "[f-17] adoszam": "",
              "[f-18] kozossegi_adoszam": "Ha a 'Közösségi adószám' szöveg nincs rajta a számlán, akkor a mező értéke null legyen"
            },
            "datumok": {
              "[f-22] szamla_kelte": "",
              "[f-23] teljesites_datuma": "",
              "[f-24] fizetesi_feltetel": "",
              "[f-25] fizetesi_hatarido": ""
            },
            "tetel": [
              {
                "tetel-sor": 1,
                "termek-tetel":{
                    "[f-26] I6_cikkszam": "A leírás kapcsos zárójelekkel jelölt része",
                    "[f-27] termek_megnevezes": "A leírás a ']' kapcsos zárójel és a 'Cikkszám:' kifejezés közötti szöveges rész. A leírás sortörést is tartalmaz, azt nem kell figyelembe venni. A termek_megnevezes mezőbe csak a termék nevét kell beilleszteni.",
                    "termek-csoport": "A termék megnevezésből kell meghatározni. Ha a megnevezésben szerepel a DJI szó, akkor a termékcsoport DJI, ha a Roborock szó van a termék megnevezésben, akkor Roborock legyen a termékcsoport neve",
                    "[f-28] Cikkszam": "A 'Cikkszám:' és az 'EAN:' szövegek közötti része a leírásnak",
                    "[f-29] EAN": "A leírásban szereplő 'EAN:' szöveg utáni rész",
                    "[f-31] tetel_mennyiseg": "",
                    "[f-32] tetel_egyseg_ar": "",
                    "[f-33] tetel_netto_ar": "",
                    "[f-34] tetel_ado_mertek": "...%",
                    "[f-35] tetel_ado_osszeg": "",
                    "[f-36] tetel_brutto_ar": ""
                }
              },
              {
                "tetel-sor": 2,
                "szallitasi-dij-tetel":{
                    "[f-30] Kiszállítási díj":"Amennyiben a '[T2] Transport to clients' szöveg van az f-30-as mezőben, akkor azt a Leírásban új tételként kell kezelni, '[T2] Transport to clients' néven.",
                    "[f-31] tetel_mennyiseg": "",
                    "[f-32] tetel_egyseg_ar": "",
                    "[f-33] tetel_netto_ar": "",
                    "[f-34] tetel_ado_mertek": "...%",
                    "[f-35] tetel_ado_osszeg": "",
                    "[f-36] tetel_brutto_ar": ""
                }
              }
            ],
            "ado": {
              "[f-40] ado_alap": "",
              "[f-41] ado_osszeg": ""
            },
            "osszegek": {
              "[f-37] fizetendo_netto_osszeg": "",
              "[f-38] fizetendo_brutto_osszeg": "",
              "[f-39] fizetendo_osszeg": ""
            },
            "[f-42] szamla_megjegyezesek": "",
            "szamla_lablec": {
              "elerhetoseg": {
                "[f-43] honlap": "",
                "[f-44] email": "",
                "[f-45] telefon": ""
              }
            },
            "[f-46] oldal": "A kettőspont utáni string",
            "[f-47] üres mezők száma": "Ide kéne írni, hogy a 46 mezőből hány üres van, tehát az olyan mezők száma, ahol a mezőben nincs adat.",
            "[f-48] üres mezők elnevezése": "Fel kellene itt sorolni az üres mezők neveit."
          }

          Return the filled JSON template with the extracted data from the provided invoice.
        `
      }
    ]);

    console.log('Received response from Gemini');
    let generatedJson = result.response.text();

    // Clean up the JSON string to avoid any parsing errors
    generatedJson = generatedJson
      .replace(/^\s*```json\s*/, '')  // Remove the starting ```json if exists
      .replace(/\s*```\s*$/, '')      // Remove the ending ``` if exists
      .replace(/\n/g, '')             // Remove all newline characters
      .replace(/\s{2,}/g, ' ')        // Replace multiple spaces with a single space
      .replace(/,(?=\s*})/g, '')      // Remove trailing commas before closing braces
      .trim();

    try {
      const parsedJson = JSON.parse(generatedJson);
      console.log('Valid JSON generated:', JSON.stringify(parsedJson, null, 2));

      // Save to Firestore
      const docRef = firestore.collection('AI-Invoices').doc(filename);
      await docRef.set(parsedJson);
      console.log('JSON saved to Firestore');

      return NextResponse.json({ text: JSON.stringify(parsedJson) });
    } catch (error) {
      console.error('JSON parsing failed. Raw response:', generatedJson);
      throw new Error('Invalid JSON generated');
    }
  } catch (error) {
    console.error('Error processing invoice:', error.message);
    return NextResponse.json({ error: 'Failed to analyze invoice', details: error.message }, { status: 500 });
  }
}

