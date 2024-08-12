import { Configuration, OpenAIApi } from 'openai';
import { createWorker } from 'tesseract.js';
import { getDocument } from 'pdfjs-dist';

// OpenAI API konfiguráció
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function processInvoice(pdfUrl: string) {
  // 1. PDF-ből szöveg kinyerése
  const text = await extractTextFromPdf(pdfUrl);

  // 2. AI-alapú szövegfeldolgozás
  const structuredData = await extractStructuredData(text);

  // 3. Adatok validálása és formázása
  const validatedData = validateAndFormatData(structuredData);

  // 4. Adatok mentése adatbázisba
  await saveToDatabase(validatedData);

  return validatedData;
}

async function extractTextFromPdf(pdfUrl: string): Promise<string> {
  const pdf = await getDocument(pdfUrl).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
}

async function extractStructuredData(text: string) {
  const prompt = `
    Elemezd az alábbi számla szövegét, és strukturáld JSON formátumba:
    
    ${text}
    
    A JSON struktúra a következő mezőket tartalmazza:
    - invoice_number: számla sorszáma
    - issuer: kibocsátó cég adatai (név, cím, adószám, bankszámlaszám)
    - buyer: vevő adatai (név, cím, adószám)
    - dates: dátumok (számla kelte, teljesítés dátuma, fizetési határidő)
    - items: tételek listája (megnevezés, mennyiség, egységár, nettó ár, áfa, bruttó ár)
    - totals: végösszegek (nettó összeg, áfa összeg, bruttó összeg)
    
    Válaszolj csak a JSON objektummal, további magyarázat nélkül.
  `;

  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: prompt,
    max_tokens: 1000,
    temperature: 0.1,
  });

  return JSON.parse(response.data.choices[0].text.trim());
}

function validateAndFormatData(data: any) {
  // Itt implementálhatók az adatvalidációs és formázási logikák
  // Például: dátumok formázása, összegek ellenőrzése, stb.
  return data;
}

async function saveToDatabase(data: any) {
  // Itt implementálható az adatbázisba mentés logikája
  // Például: Firebase Firestore használata
  // const docRef = await addDoc(collection(db, "invoices"), data);
  console.log("Adatok mentve az adatbázisba:", data);
}