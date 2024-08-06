import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// Inicializáljuk a pdfjs-t
const pdfjsLib = pdfjs as any;
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Az InvoiceData interface definíciója (a korábban megadott struktúra alapján)

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  return textContent.items.map((item: any) => item.str).join(' ');
};

export const convertTextToJson = (text: string): InvoiceData => {
  const invoiceData: InvoiceData = {
    szamla_szam: {
      "[f-01] szla_prefix": "",
      "[f-02] szla_year": "",
      "[f-03] ODU_szamlaszam": "",
    },
    kibocsato: {
      "[f-04] cegnev": "",
      cim: {
        "[f-08] orszag": "",
        "[f-05] telepules": "",
        "[f-07] iranyitoszam": "",
        "[f-06] utca_hsz": "",
      },
      "[f-09] adoszam": "",
      bankszamla: {
        "[f-10] szamlaszam": "",
        "[f-11] bank": "",
      },
      "[f-19] ODU_rendeles_szam": "",
      "[f-20] I6_rendeles_szam": "",
      "[f-21] I6_szamlaszam": "",
    },
    vevo: {
      "[f-12] cegnev": "",
      cim: {
        "[f-16] orszag": "",
        "[f-13] telepules": "",
        "[f-15] iranyitoszam": "",
        "[f-14] utca_hsz": "",
      },
      "[f-17] adoszam": "",
      "[f-18] kozossegi_adoszam": "",
    },
    datumok: {
      "[f-22] szamla_kelte": "",
      "[f-23] teljesites_datuma": "",
      "[f-24] fizetesi_feltetel": "",
      "[f-25] fizetesi_hatarido": "",
    },
    tetel: [],
    osszegek: {
      "[f-36] netto_osszeg": 0,
      "[f-40] ado_osszeg": 0,
      "[f-37] brutto_osszeg": 0,
      "[f-38] fizetendo_osszeg": 0,
    },
    "[f-41] szamla_megjegyezesek": "",
    szamla_design: {
      szamla_lablec: {
        elerhetoseg: {
          "[f-42] honlap": "",
          "[f-43] email": "",
          "[f-44] telefon": "",
        },
      },
      szamla_fejlec: {
        logo: "",
      },
    },
    "[f-45] oldal": "",
  };

  // Számla szám kinyerése
  const szamlaRegex = /INV\/(\d{4})\/(\d+)/;
  const szamlaMatch = text.match(szamlaRegex);
  if (szamlaMatch) {
    invoiceData.szamla_szam["[f-01] szla_prefix"] = "INV";
    invoiceData.szamla_szam["[f-02] szla_year"] = szamlaMatch[1];
    invoiceData.szamla_szam["[f-03] ODU_szamlaszam"] = szamlaMatch[2];
  }

  // Kibocsátó adatainak kinyerése
  const kibocsatoRegex = /WESTech HU Kft\.\s+(.*?)\s+(\d{4})\s+(.*?)\s+Magyarország/;
  const kibocsatoMatch = text.match(kibocsatoRegex);
  if (kibocsatoMatch) {
    invoiceData.kibocsato["[f-04] cegnev"] = "WESTech HU Kft.";
    invoiceData.kibocsato.cim["[f-06] utca_hsz"] = kibocsatoMatch[1].trim();
    invoiceData.kibocsato.cim["[f-07] iranyitoszam"] = kibocsatoMatch[2];
    invoiceData.kibocsato.cim["[f-05] telepules"] = kibocsatoMatch[3].trim();
    invoiceData.kibocsato.cim["[f-08] orszag"] = "Magyarország";
  }

  // Adószám kinyerése
  const adoszamRegex = /Adószám:\s*(\d{8}-\d{1}-\d{2})/;
  const adoszamMatch = text.match(adoszamRegex);
  if (adoszamMatch) {
    invoiceData.kibocsato["[f-09] adoszam"] = adoszamMatch[1];
  }

  // Bankszámla adatok kinyerése
  const bankszamlaRegex = /Bankszámla:\s*(.*?)\s*-\s*(.*)/;
  const bankszamlaMatch = text.match(bankszamlaRegex);
  if (bankszamlaMatch) {
    invoiceData.kibocsato.bankszamla["[f-10] szamlaszam"] = bankszamlaMatch[1].trim();
    invoiceData.kibocsato.bankszamla["[f-11] bank"] = bankszamlaMatch[2].trim();
  }

  // Vevő adatainak kinyerése
  const vevoRegex = /VEVŐ\s+(.*?)\s+(.*?)\s+(\d{4})\s+(.*?)\s+Magyarország/;
  const vevoMatch = text.match(vevoRegex);
  if (vevoMatch) {
    invoiceData.vevo["[f-12] cegnev"] = vevoMatch[1].trim();
    invoiceData.vevo.cim["[f-14] utca_hsz"] = vevoMatch[2].trim();
    invoiceData.vevo.cim["[f-15] iranyitoszam"] = vevoMatch[3];
    invoiceData.vevo.cim["[f-13] telepules"] = vevoMatch[4].trim();
    invoiceData.vevo.cim["[f-16] orszag"] = "Magyarország";
  }

  // Vevő adószám és közösségi adószám kinyerése
  const vevoAdoszamRegex = /Adószám:\s*(\d{8}-\d{1}-\d{2})/;
  const vevoAdoszamMatch = text.match(vevoAdoszamRegex);
  if (vevoAdoszamMatch) {
    invoiceData.vevo["[f-17] adoszam"] = vevoAdoszamMatch[1];
  }

  const kozossegiAdoszamRegex = /Közösségi adószám:\s*(\w+-\d+-\d+)/;
  const kozossegiAdoszamMatch = text.match(kozossegiAdoszamRegex);
  if (kozossegiAdoszamMatch) {
    invoiceData.vevo["[f-18] kozossegi_adoszam"] = kozossegiAdoszamMatch[1];
  }

  // Dátumok kinyerése
  const datumRegex = /SZÁMLA KELTE:\s*(\d{4}-\d{2}-\d{2})\s*TELJESÍTÉS DÁTUMA:\s*(\d{4}-\d{2}-\d{2})\s*FIZETÉSI FELTÉTEL:\s*(.*?)\s*FIZETÉSI HATÁRIDŐ:\s*(\d{4}-\d{2}-\d{2})/;
  const datumMatch = text.match(datumRegex);
  if (datumMatch) {
    invoiceData.datumok["[f-22] szamla_kelte"] = datumMatch[1];
    invoiceData.datumok["[f-23] teljesites_datuma"] = datumMatch[2];
    invoiceData.datumok["[f-24] fizetesi_feltetel"] = datumMatch[3];
    invoiceData.datumok["[f-25] fizetesi_hatarido"] = datumMatch[4];
  }

  // Tétel adatainak kinyerése
  const tetelRegex = /(\w+)\s+(.*?)\s+Cikkszám:\s+(\w+)\s+EAN:\s+(\d+)\s+(\d+,\d+)\s+(\d+)\s+(\d+)\s+(\d+%)\s+(\d+)\s+(\d+)/;
  const tetelMatch = text.match(tetelRegex);
  if (tetelMatch) {
    const tetel = {
      "[f-26] I6_cikkszam": tetelMatch[1],
      "[f-27] termek_megnevezes": tetelMatch[2],
      "[f-28] DJI_cikkszam": tetelMatch[3],
      "[f-29] EAN": tetelMatch[4],
      "[f-30] mennyiseg": parseFloat(tetelMatch[5].replace(',', '.')),
      "[f-31] egyseg_ar": parseFloat(tetelMatch[6]),
      "[f-32] netto_ar": parseFloat(tetelMatch[7]),
      "ado": {
        "[f-33] mertek": tetelMatch[8],
        "[f-39] ado_alap": parseFloat(tetelMatch[7]),
        "[f-34] osszeg": parseFloat(tetelMatch[9])
      },
      "[f-35] brutto_ar": parseFloat(tetelMatch[10])
    };
    invoiceData.tetel.push(tetel);
  }

  // Összegek kinyerése
  const osszegekRegex = /Nettó összeg\s+(\d+)\s+Összesen\s+(\d+)\s+FIZETENDŐ ÖSSZEG\s+(\d+)/;
  const osszegekMatch = text.match(osszegekRegex);
  if (osszegekMatch) {
    invoiceData.osszegek["[f-36] netto_osszeg"] = parseFloat(osszegekMatch[1]);
    invoiceData.osszegek["[f-37] brutto_osszeg"] = parseFloat(osszegekMatch[2]);
    invoiceData.osszegek["[f-38] fizetendo_osszeg"] = parseFloat(osszegekMatch[3]);
  }

  const adoOsszegRegex = /Adó összege\s+(\d+)/;
  const adoOsszegMatch = text.match(adoOsszegRegex);
  if (adoOsszegMatch) {
    invoiceData.osszegek["[f-40] ado_osszeg"] = parseFloat(adoOsszegMatch[1]);
  }

  // Lábléc adatok kinyerése
  invoiceData.szamla_design.szamla_lablec.elerhetoseg["[f-42] honlap"] = "https://online.westech.hu";
  invoiceData.szamla_design.szamla_lablec.elerhetoseg["[f-43] email"] = "info@westech.hu";
  invoiceData.szamla_design.szamla_lablec.elerhetoseg["[f-44] telefon"] = "+36 30 148 4883";

  // Oldalszám kinyerése
  const oldalszamRegex = /Oldal:\s*(\d+\s*\/\s*\d+)/;
  const oldalszamMatch = text.match(oldalszamRegex);
  if (oldalszamMatch) {
    invoiceData["[f-45] oldal"] = oldalszamMatch[1];
  }

  return invoiceData;
};