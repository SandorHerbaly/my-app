import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

if (!admin.apps.length) {
  const serviceAccountPath = path.join(process.cwd(), 'credentials', 'Firebase-SA-key.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const firestore = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const storage = getStorage().bucket();
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const promptTemplates = {
  'Orders': {
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
  },
  'Invoices': {
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
  },
// ... (előző rész folytatása)

'WSK Invoices': {
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
},
'Bank Statements': {
  text: `
    Extract the full text content from the provided bank account statement document. 
    Then, fill the following JSON template with the extracted data:

    {
      "[bt-001] pdf-text": "Ide illeszd be a teljes kinyert szöveges tartalmat a pdf dokumentumból",
      "fejlec_adatok": {
        "[bt-01] bank_nev": "A bank teljes neve, általában a dokumentum tetején található",
        "[bt-02] bank_cim": "A bank címe, általában az első oldalon a fejlécben található",
        "[bt-03] tax_id_number": "Az adószám, általában 'Tax ID Number:' után található",
        "[bt-04] group_id": "A 'Group ID:' után található azonosító",
        "[bt-05] community_tax_number": "A 'Community tax number:' után található szám",
        "[bt-06] register_nr": "A 'Register Nr.:' után található azonosító"
      },
      "szamlainformaciok": {
        "[bt-07] account_holder": "A számlatulajdonos neve, általában 'Account holder:' után található",
        "[bt-08] account_number": "A bankszámlaszám, általában 'Account number:' után található",
        "[bt-09] iban_number": "Az IBAN szám, általában 'IBAN number:' után található",
        "[bt-10] bank_id": "A bank azonosítója, általában 'Bank ID:' után található",
        "[bt-11] account_type": "A számla típusa, általában 'Account type:' után található",
        "[bt-12] currency": "A számla pénzneme, általában 'Currency:' után található",
        "[bt-13] fee_package": "A díjcsomag neve, általában 'Fee package:' után található"
      },
      "kivonat_adatok": {
        "[bt-14] statement_date": "A kivonat dátuma, általában 'Statement date:' után található, ÉÉÉÉ-HH-NN formátumban",
        "[bt-15] period_start": "A kivonat időszakának kezdő dátuma, ÉÉÉÉ-HH-NN formátumban",
        "[bt-16] period_end": "A kivonat időszakának záró dátuma, ÉÉÉÉ-HH-NN formátumban",
        "[bt-17] statement_serial_number": "A kivonat sorszáma, általában 'Statement serial number:' után található"
      },
      "tranzakciok": [
        {
          "[bt-18] oldal_szam": "Az aktuális oldalszám, minden oldal tetején található",
          "[bt-19] posting_date": "A könyvelés dátuma, ÉÉÉÉ-HH-NN formátumban",
          "[bt-20] value_date": "Az értéknap, ÉÉÉÉ-HH-NN formátumban",
          "[bt-21] transaction_type": "A tranzakció típusa",
          "[bt-22] transaction_details": "A tranzakció részletes leírása",
          "[bt-23] debit": "A terhelés összege, csak számokat és tizedespontot használj",
          "[bt-24] credit": "A jóváírás összege, csak számokat és tizedespontot használj"
        }
      ],
      "egyenlegek": {
        "[bt-25] opening_balance": "A nyitóegyenleg, csak számokat és tizedespontot használj",
        "[bt-26] credits_total": "Az összes jóváírás, csak számokat és tizedespontot használj",
        "[bt-27] debits_total": "Az összes terhelés, csak számokat és tizedespontot használj",
        "[bt-28] closing_balance": "A záróegyenleg, csak számokat és tizedespontot használj"
      },
      "egyeb_informaciok": {
        "[bt-29] available_balance": "A rendelkezésre álló egyenleg, csak számokat és tizedespontot használj",
        "[bt-30] blocked_amount_card": "A kártyatranzakciók miatt zárolt összeg, csak számokat és tizedespontot használj",
        "[bt-31] blocked_amount_other": "Egyéb okok miatt zárolt összeg, csak számokat és tizedespontot használj",
        "[bt-32] pre_indicated_credit": "Előjelzett jóváírások összege, csak számokat és tizedespontot használj",
        "[bt-33] pre_indicated_debit": "Előjelzett terhelések összege, csak számokat és tizedespontot használj"
      },
      "[bt-34] total_charges": "A kivonat szerinti összes bankköltség, csak számokat és tizedespontot használj"
    }

    Return the filled JSON template with the extracted data from the provided bank account statement.
    Notes:
    1. The 'tranzakciok' array should contain all transactions found in the statement. Repeat the transaction structure for each transaction, including the page number where it appears.
    2. Ensure all dates are in YYYY-MM-DD format.
    3. For numeric values, use only digits and decimal points, without currency symbols or thousands separators.
    4. If a field is not found in the document or not applicable, leave it as an empty string or null as appropriate.
    5. Pay special attention to multi-page documents, ensuring all transactions from all pages are captured.
    6. The 'oldal_szam' field in each transaction should reflect the page number where the transaction is listed.
  `
}
};

export async function processDocument(req: NextRequest, documentType: string) {
try {
  const { filename } = await req.json();
  const file = storage.file(`${documentType.toLowerCase()}/${filename}`);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`File not found: ${documentType.toLowerCase()}/${filename}`);
  }

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000,
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const dataToSend = Buffer.from(buffer).toString('base64');
  const mimeType = filename.endsWith('.pdf') ? 'application/pdf' : 'image/png';

  const result = await model.generateContent([
    {
      inlineData: {
        data: dataToSend,
        mimeType: mimeType
      }
    },
    { text: promptTemplates[documentType].text }
  ]);

  let generatedJson = result.response.text()
    .replace(/^\s*```json\s*/, '')
    .replace(/\s*```\s*$/, '')
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/,(?=\s*})/g, '')
    .trim();

  const parsedJson = JSON.parse(generatedJson);
  const docRef = firestore.collection(`AI-${documentType.replace(' ', '')}`).doc(filename);
  await docRef.set(parsedJson);

  return NextResponse.json({ text: JSON.stringify(parsedJson) });
} catch (error) {
  console.error(`Error processing ${documentType}:`, error);
  return NextResponse.json({ error: `Failed to analyze ${documentType}`, details: error.message }, { status: 500 });
}
}