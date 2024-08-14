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
      { 
        text: `
          Az alábbi dokumentum egy számla. 
          Kérlek, az alábbi JSON formátumban nyerd ki belőle az adatokat:

          {
            "szamla_szam": {
              "[f-01] szla_prefix": "A számla előtagja, pl. 'INV'",
              "[f-02] szla_year": "A számla kiállításának éve",
              "[f-03] ODU_szamlaszam": "A számla sorszáma",
              "[f-00] penznem": "A számlán feltüntetett pénznem, pl. 'HUF'"
            },
            "kibocsato": {
              "[f-04] cegnev": "A kibocsátó cég neve",
              "cim": {
                "[f-08] orszag": "A kibocsátó országa",
                "[f-05] telepules": "A kibocsátó települése",
                "[f-07] iranyitoszam": "A kibocsátó irányítószáma",
                "[f-06] utca_hsz": "A kibocsátó utca és házszám"
              },
              "[f-09] adoszam": "A kibocsátó adószáma",
              "bankszamla": {
                "[f-10] szamlaszam": "A kibocsátó bankszámlaszáma",
                "[f-11] bank": "A kibocsátó bankja"
              },
              "[f-19] ODU_rendeles_szam": "A Forrás alatti két karakterlánc első S betűvel kezdődő része",
              "[f-20] I6_rendeles_szam": "A Forrás második COR prefixel kezdődő része",
              "[f-21] I6_szamlaszam": "A referencia alatti azonosító szám"
            },
            "vevo": {
              "[f-12] cegnev": "A vevő cég neve",
              "cim": {
                "[f-16] orszag": "A vevő országa",
                "[f-13] telepules": "A vevő települése",
                "[f-15] iranyitoszam": "A vevő irányítószáma",
                "[f-14] utca_hsz": "A vevő utca és házszám"
              },
              "[f-17] adoszam": "A vevő adószáma",
              "[f-18] kozossegi_adoszam": "A vevő közösségi adószáma"
            },
            "datumok": {
              "[f-22] szamla_kelte": "A számla kiállításának dátuma",
              "[f-23] teljesites_datuma": "A számla teljesítésének dátuma",
              "[f-24] fizetesi_feltetel": "A fizetési feltétel",
              "[f-25] fizetesi_hatarido": "A fizetési határidő"
            },
            "tetel": [
              {
                "tetel-sor": 1,
                "termek-tetel": {
                  "[f-26] I6_cikkszam": "Az első tétel cikkszáma",
                  "[f-27] termek_megnevezes": "Az első tétel termék megnevezése",
                  "termek-csoport": "Az első tétel termék csoportja",
                  "[f-28] Cikkszam": "Az első tétel cikkszáma a leírásban",
                  "[f-29] EAN": "Az első tétel EAN kódja",
                  "[f-31] tetel_mennyiseg": "Az első tétel mennyisége",
                  "[f-32] tetel_egyseg_ar": "Az első tétel egységára",
                  "[f-33] tetel_netto_ar": "Az első tétel nettó ára",
                  "[f-34] tetel_ado_mertek": "Az első tétel áfa mértéke",
                  "[f-35] tetel_ado_osszeg": "Az első tétel áfa összege",
                  "[f-36] tetel_brutto_ar": "Az első tétel bruttó ára"
                }
              },
              {
                "tetel-sor": 2,
                "szallitasi-dij-tetel": {
                  "[f-30] Kiszállítási díj": "A kiszállítási díj neve",
                  "[f-31] tetel_mennyiseg": "A kiszállítási díj mennyisége",
                  "[f-32] tetel_egyseg_ar": "A kiszállítási díj egységára",
                  "[f-33] tetel_netto_ar": "A kiszállítási díj nettó ára",
                  "[f-34] tetel_ado_mertek": "A kiszállítási díj áfa mértéke",
                  "[f-35] tetel_ado_osszeg": "A kiszállítási díj áfa összege",
                  "[f-36] tetel_brutto_ar": "A kiszállítási díj bruttó ára"
                }
              }
            ],
            "ado": {
              "[f-40] ado_alap": "Az adó alapja",
              "[f-41] ado_osszeg": "Az adó összege"
            },
            "osszegek": {
              "[f-37] fizetendo_netto_osszeg": "A fizetendő nettó összeg",
              "[f-38] fizetendo_brutto_osszeg": "A fizetendő bruttó összeg",
              "[f-39] fizetendo_osszeg": "A fizetendő összeg"
            },
            "[f-42] szamla_megjegyezesek": "Számla megjegyzések",
            "szamla_lablec": {
              "elerhetoseg": {
                "[f-43] honlap": "Honlap címe",
                "[f-44] email": "Email cím",
                "[f-45] telefon": "Telefonszám"
              }
            },
            "[f-46] oldal": "Oldal száma",
            "[f-47] üres mezők száma": "Üres mezők száma",
            "[f-48] üres mezők elnevezése": "Üres mezők elnevezése"
          }
        `
      }
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
