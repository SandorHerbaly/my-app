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
          Extract the full text content from the provided invoice document. 
          Then, fill the following JSON template with the extracted data:
      
          {
            "[i-001] pdf-text": "Ide illeszd be a teljes kinyert szöveges tartalmat a pdf dokumentumból",
            "szamla_szam": {
              "[i-01] szla_prefix": "A számla azonosítójának első része, általában betűk",
              "[i-02] szla_year": "A számla azonosítójában szereplő évszám",
              "[i-03] ODU_szamlaszam": "A számla egyedi azonosító száma",
              "[i-04] penznem": "A számla pénzneme, alapértelmezetten 'HUF', de ellenőrizd a dokumentumban"
            },
            "[o-01] rendeles_szam": "A Forrás alatti két karakterlánc első S betűvel kezdődő része. Ha nincs ilyen, hagyd üresen",
            "kibocsato": {
              "[i-05] cegnev": "A számlát kiállító cég teljes neve",
              "cim": {
                "[i-06] orszag": "A kibocsátó cég országa",
                "[i-07] telepules": "A kibocsátó cég városa vagy települése",
                "[i-08] iranyitoszam": "A kibocsátó cég irányítószáma",
                "[i-09] utca_hsz": "A kibocsátó cég utca és házszám adata"
              },
              "[i-10] adoszam": "A kibocsátó cég adószáma",
              "bankszamla": {
                "[i-11] szamlaszam": "A kibocsátó cég bankszámlaszáma",
                "[i-12] bank": "A kibocsátó cég bankjának neve"
              },
              "[i-13] I6_rendeles_szam": "A Forrás második COR prefixel kezdődő része. Ha nincs ilyen, hagyd üresen",
              "[i-14] I6_szamlaszam": "A referencia alatti azonosító szám. Ha nincs ilyen, hagyd üresen"
            },
            "vevo": {
              "[i-15] cegnev": "A vevő cég teljes neve",
              "cim": {
                "[i-16] orszag": "A vevő cég országa",
                "[i-17] telepules": "A vevő cég városa vagy települése",
                "[i-18] iranyitoszam": "A vevő cég irányítószáma",
                "[i-19] utca_hsz": "A vevő cég utca és házszám adata"
              },
              "[i-20] adoszam": "A vevő cég adószáma",
              "[i-21] kozossegi_adoszam": "A vevő cég közösségi adószáma. Ha a 'Közösségi adószám' szöveg nincs a számlán, akkor az érték legyen null"
            },
            "datumok": {
              "[i-22] szamla_kelte": "A számla kiállításának dátuma ÉÉÉÉ-HH-NN formátumban",
              "[i-23] teljesites_datuma": "A teljesítés dátuma ÉÉÉÉ-HH-NN formátumban",
              "[i-24] fizetesi_feltetel": "A fizetési feltétel pontos megnevezése",
              "[i-25] fizetesi_hatarido": "A fizetési határidő dátuma ÉÉÉÉ-HH-NN formátumban"
            },
            "tetel": [
              {
                "tetel-sor": 1,
                "termek-tetel": {
                  "[i-26] I6_cikkszam": "A leírás kapcsos zárójelekkel jelölt része. Ha nincs ilyen, hagyd üresen",
                  "[i-27] termek_megnevezes": "A leírás a ']' kapcsos zárójel és a 'Cikkszám:' kifejezés közötti szöveges rész. A leírás sortörést is tartalmazhat, azt ne vedd figyelembe. Csak a termék nevét illeszd be",
                  "termek-csoport": "Ha a termék megnevezésében szerepel a 'DJI' szó, akkor 'DJI', ha a 'Roborock' szó szerepel, akkor 'Roborock'. Egyéb esetben hagyd üresen",
                  "[i-28] Cikkszam": "A 'Cikkszám:' és az 'EAN:' szövegek közötti része a leírásnak. Ha nincs ilyen, hagyd üresen",
                  "[i-29] EAN": "A leírásban szereplő 'EAN:' szöveg utáni rész. Ha nincs ilyen, hagyd üresen",
                  "[i-30] tetel_mennyiseg": "A tételhez tartozó mennyiség számértékként",
                  "[i-31] tetel_egyseg_ar": "A tétel egységára számértékként, tizedesjegyekkel",
                  "[i-32] tetel_netto_ar": "A tétel nettó ára számértékként, tizedesjegyekkel",
                  "[i-33] tetel_ado_mertek": "Az adó mértéke százalékban, pl. '27%'",
                  "[i-34] tetel_ado_osszeg": "A tételre vonatkozó adó összege számértékként, tizedesjegyekkel",
                  "[i-35] tetel_brutto_ar": "A tétel bruttó ára számértékként, tizedesjegyekkel"
                }
              },
              {
                "tetel-sor": 2,
                "szallitasi-dij-tetel": {
                  "[i-36] Kiszállítási díj": "Ha a '[T2] Transport to clients' szöveg szerepel, akkor ezt használd. Egyébként hagyd üresen",
                  "[i-37] tetel_mennyiseg": "A szállítási díj mennyisége, általában 1",
                  "[i-38] tetel_egyseg_ar": "A szállítási díj egységára számértékként, tizedesjegyekkel",
                  "[i-39] tetel_netto_ar": "A szállítási díj nettó ára számértékként, tizedesjegyekkel",
                  "[i-40] tetel_ado_mertek": "A szállítási díjra vonatkozó adó mértéke százalékban, pl. '27%'",
                  "[i-41] tetel_ado_osszeg": "A szállítási díjra vonatkozó adó összege számértékként, tizedesjegyekkel",
                  "[i-42] tetel_brutto_ar": "A szállítási díj bruttó ára számértékként, tizedesjegyekkel"
                }
              }
            ],
            "ado": {
              "[i-43] ado_alap": "Az összes tétel nettó árának összege számértékként, tizedesjegyekkel",
              "[i-44] ado_osszeg": "Az összes tételre vonatkozó adó összege számértékként, tizedesjegyekkel"
            },
            "osszegek": {
              "[i-45] fizetendo_netto_osszeg": "A fizetendő nettó összeg számértékként, tizedesjegyekkel",
              "[i-46] fizetendo_brutto_osszeg": "A fizetendő bruttó összeg számértékként, tizedesjegyekkel",
              "[i-47] fizetendo_osszeg": "A végső fizetendő összeg számértékként, tizedesjegyekkel"
            },
            "[i-48] szamla_megjegyezesek": "Bármilyen további megjegyzés vagy információ a számlán",
            "szamla_lablec": {
              "elerhetoseg": {
                "[i-49] honlap": "A kibocsátó cég honlapjának címe",
                "[i-50] email": "A kibocsátó cég e-mail címe",
                "[i-51] telefon": "A kibocsátó cég telefonszáma"
              }
            },
            "[i-52] oldal": "Az oldalszám, ha több oldalas a számla. A kettőspont utáni string-et használd"
          }
      
          Return the filled JSON template with the extracted data from the provided invoice.
          Note: The 'tetel' array should contain all product items found in the invoice. Repeat the 'termek-tetel' structure for each item, incrementing the 'tetel-sor' number.
          Ensure all dates are in YYYY-MM-DD format.
          For numeric values, use only digits and decimal points, without currency symbols or thousands separators.
          If a field is not found in the document or not applicable, leave it as an empty string or null as appropriate.
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

