import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

console.log('Starting analyze-bank-statement route');

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
  console.log('Received analyze-bank-statement POST request');
  try {
    const { pdf_filename, type } = await req.json();
    console.log(`Processing file: ${pdf_filename} of type: ${type}`);

    const collectionName = 'UploadedBankStatements';

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
          Nyerd ki a releváns információkat a megadott bankszámlakivonat pdf fájlból.
      
          Az első oldalon található fix tartalom alapján töltsd ki a következő mezőket:
          
          {
            "szamlainformaciok": {
              "[bt-01] account_holder": "A számlatulajdonos neve",
              "[bt-02] account_number": "A bankszámlaszám",
              "[bt-03] iban_number": "Az IBAN szám",
              "[bt-04] bank_id": "A bank azonosítója",
              "[bt-05] account_type": "A számla típusa",
              "[bt-06] currency": "A számla pénzneme",
              "[bt-07] fee_package": "A díjcsomag neve",
              "[bt-08] statement_date": "A kivonat dátuma, ÉÉÉÉ-HH-NN formátumban",
              "[bt-09] period": "A kivonat időszaka, ÉÉÉÉ-HH-NN formátumban",
              "[bt-10] statement_serial_number": "A kivonat sorszáma"
            }
          }
      
          A második oldalon található tranzakciók alapján töltsd ki a következő mezőket:
          
          {
            "tranzakciok": [
              {
                "[bt-11] posting_date": "A könyvelés dátuma, ÉÉÉÉ-HH-NN formátumban",
                "[bt-12] value_date": "Az értéknap, ÉÉÉÉ-HH-NN formátumban",
                "[bt-13] transaction_type": "A tranzakció típusa",
                "[bt-14] transaction_details": {
                  "acc_number": "Az Acc. után található 7x4 karakteres számsor",
                  "company_name": "A 7x4 karakteres számsor után közvetlenül található cég neve",
                  "ref_number": "A Ref. után található 16 karakteres azonosító",
                  "note": "A Note utáni szöveget írja ki egy az egyben, anélkül hogy értelmezné, mivel az mindig változó lehet."
                },
                "[bt-15] debit": "A terhelés összege, csak számokat és tizedespontot használj",
                "[bt-16] credit": "A jóváírás összege, csak számokat és tizedespontot használj"
              }
            ]
          }
      
          A lista végén található összesítés alapján töltsd ki a következő mezőket:
          
          {
            "osszegzes": {
              "[bt-17] opening_balance": "A nyitóegyenleg, csak számokat és tizedespontot használj",
              "[bt-18] credits_total": "Az összes jóváírás, csak számokat és tizedespontot használj",
              "[bt-19] debits_total": "Az összes terhelés, csak számokat és tizedespontot használj",
              "[bt-20] closing_balance": "A záróegyenleg, csak számokat és tizedespontot használj",
              "[bt-21] available_balance": "A rendelkezésre álló egyenleg, csak számokat és tizedespontot használj",
              "[bt-22] blocked_amount_card": "A kártyatranzakciók miatt zárolt összeg, csak számokat és tizedespontot használj",
              "[bt-23] blocked_amount_other": "Egyéb okok miatt zárolt összeg, csak számokat és tizedespontot használj",
              "[bt-24] pre_indicated_credit": "Előjelzett jóváírások összege, csak számokat és tizedespontot használj",
              "[bt-25] pre_indicated_debit": "Előjelzett terhelések összege, csak számokat és tizedespontot használj"
            }
          }
      
          Győződj meg arról, hogy az összes kinyert szám megfelel a szükséges formátumnak.
          - A dátumokat ÉÉÉÉ-HH-NN formátumban kell megadni.
          - Minden összeget decimális ponttal rendelkező számként kell megjeleníteni, valutajel és ezerelválasztó nélkül.
          Ha egy mező nem található meg a képen vagy nem alkalmazható, hagyd üresen vagy null értékkel.
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
      const docRef = firestore.collection('AI-Analyses').doc(ai_json_filename);
      await docRef.set(parsedJson);
      console.log(`AI elemzés eredménye elmentve: ${ai_json_filename}`);

      // EventLog bejegyzés
      const eventLogRef = await firestore.collection('EventLog').add({
        action: 'analyse document',
        fileName: pdf_filename,
        aiFileName: ai_json_filename,
        collection: 'AI-Analyses',
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
      console.error('Error processing bank statement:', error.message);
      return NextResponse.json({ error: 'Failed to analyze bank statement', details: error.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing bank statement:', error.message);
    return NextResponse.json({ error: 'Failed to analyze bank statement', details: error.message }, { status: 500 });
  }
}