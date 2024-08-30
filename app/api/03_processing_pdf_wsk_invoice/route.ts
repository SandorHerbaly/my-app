import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

console.log('Starting analyze-wsk-invoice route');

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
  console.log('Received analyze-wsk-invoice POST request');
  try {
    const { pdf_filename, type } = await req.json();
    console.log(`Processing file: ${pdf_filename} of type: ${type}`);

    const collectionName = 'UploadedWskInvoices';

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
          Extract the full text content from the provided WSK invoice document. 
          Then, fill the following JSON template with the extracted data:
      
          {
            "[wi-001] pdf-text": "Az teljes kinyert szöveges tartalom ide kerüljön",
            "szamla_szam": {
              "[i-01] szla_prefix": "Az 'INVOICE no.' után található karakterlánc első része a pontig",
              "[i-02] szla_year": "Az 'INVOICE no.' után található karakterlánc második része",
              "[i-03] ODU_szamlaszam": "Az 'INVOICE no.' után található karakterlánc harmadik része"
            },
            "[o-01] rendeles_szam": "Az 'Order No.:' után található karakterlánc",
            "kibocsato": {
              "[wi-04] cegnev": "A 'Vendor:' alatti első sor",
              "cim": {
                "[wi-05] utca_hsz": "A 'Vendor:' alatti második sor",
                "[wi-06] iranyitoszam": "A 'Vendor:' alatti harmadik sor első része",
                "[wi-07] telepules": "A 'Vendor:' alatti harmadik sor második része",
                "[wi-08] orszag": "A 'Vendor:' alatti harmadik sor harmadik része"
              },
              "[wi-09] reg_num": "A 'Reg.Num.:' után található érték",
              "[wi-10] vat_id": "A 'VAT ID:' után található érték",
              "[wi-11] vat_id_sk": "A 'VAT ID (SK):' után található érték",
              "[wi-12] iban": "Az 'IBAN:' után található érték",
              "[wi-13] swift": "A 'SWIFT:' után található érték",
              "[wi-14] account": "Az 'Account:' után található érték"
            },
            "vevo": {
              "[wi-15] cegnev": "A 'Customer:' alatti első sor",
              "cim": {
                "[wi-16] utca_hsz": "A 'Customer:' alatti második sor",
                "[wi-17] iranyitoszam": "A 'Customer:' alatti harmadik sor első része",
                "[wi-18] telepules": "A 'Customer:' alatti harmadik sor második része",
                "[wi-19] orszag": "A 'Customer:' alatti harmadik sor harmadik része"
              },
              "[wi-20] reg_num": "A vevő adatai között található 'Reg.Num.:' után álló érték",
              "[wi-21] vat_id": "A vevő adatai között található 'VAT ID:' után álló érték",
              "[wi-22] phone": "A 'Phone:' után található telefonszám",
              "[wi-23] email": "Az 'E-mail:' után található e-mail cím"
            },
            "datumok": {
              "[wi-24] lay_out_date": "A 'Lay out date:' mellett található dátum",
              "[wi-25] due_receiving_date": "A 'Due Receiving date:' mellett található dátum",
              "[wi-26] due_date": "A 'Due Date:' mellett található dátum"
            },
            "fizetesi_adatok": {
              "[wi-27] payment_method": "A 'Payment:' mellett található fizetési mód",
              "[wi-28] currency": "A 'Currency:' mellett található pénznem",
              "[wi-29] language": "A 'Language:' mellett található nyelv",
              "[wi-30] invoiced": "Az 'Invoiced:' mellett található érték"
            },
            "tetel": [
              {
                "tetel-sor": 1,
                "termek-tetel": {
                  "[wi-31] name_of_product": "A 'Name of product' oszlopban található terméknév",
                  "[wi-32] gtd_icpd_code": "A termék neve alatti első sorban található kód",
                  "[wi-33] warranty_period": "A 'Warranty period' oszlopban található érték",
                  "[wi-34] serial_numbers": "A 'Serial numbers' oszlopban található sorozatszámok",
                  "[wi-35] co": "A 'CO' oszlopban található érték",
                  "[wi-36] qty": "A 'Qty' oszlopban található mennyiség",
                  "[wi-37] weight_kg": "A 'Weight kg' oszlopban található súly",
                  "[wi-38] price_unit": "A 'Price/unit without VAT' oszlopban található egységár",
                  "[wi-39] price_total": "A 'Price VAT 0%' oszlopban található teljes ár",
                  "[wi-40] total": "A 'Total' oszlopban található végösszeg"
                }
              }
            ],
            "osszegek": {
              "[wi-41] total_value": "A 'Total value of invoice in ...:' sorban található összeg",
              "[wi-42] pre_paid": "A 'Pre-paid:' sorban található összeg",
              "[wi-43] total_to_be_paid": "A 'Total to be paid:' sorban található összeg",
              "[wi-44] exchange_rate": "Az 'Exchange rate:' sorban található árfolyam"
            },
            "[wi-45] megjegyzes": "A táblázat alatti megjegyzés szövege",
            "szamla_lablec": {
              "[wi-46] cegnev": "A dokumentum alján található cégnév",
              "[wi-47] cim": "A dokumentum alján található cím",
              "[wi-48] ico": "Az 'IČO:' után található érték",
              "[wi-49] ic_dph": "Az 'IČ DPH:' után található érték",
              "[wi-50] obchodny_register": "Az 'Obchodný register' után található bejegyzési adatok"
            }
          }
      
          Return the filled JSON template with the extracted data from the provided WSK invoice document.
          Note: The 'tetel' array should contain all product items found in the invoice. Repeat the 'termek-tetel' structure for each item, incrementing the 'tetel-sor' number.
          Ensure that all dates are in the format YYYY-MM-DD.
          If a field is not found in the document, leave it as an empty string.
          For numeric values, use only digits and decimal points, without currency symbols or thousands separators.
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
      console.error('Error processing WSK invoice:', error.message);
      return NextResponse.json({ error: 'Failed to analyze WSK invoice', details: error.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing WSK invoice:', error.message);
    return NextResponse.json({ error: 'Failed to analyze WSK invoice', details: error.message }, { status: 500 });
  }
}