import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// Initialize pdfjs
const pdfjsLib = pdfjs as any;
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface InvoiceData {
  szamla_szam: {
    "[f-01] szla_prefix": string;
    "[f-02] szla_year": string;
    "[f-03] ODU_szamlaszam": string;
  };
  kibocsato: {
    "[f-04] cegnev": string;
    cim: {
      "[f-08] orszag": string;
      "[f-05] telepules": string;
      "[f-07] iranyitoszam": string;
      "[f-06] utca_hsz": string;
    };
    "[f-09] adoszam": string;
    bankszamla: {
      "[f-10] szamlaszam": string;
      "[f-11] bank": string;
    };
    "[f-19] ODU_rendeles_szam": string;
    "[f-20] I6_rendeles_szam": string;
    "[f-21] I6_szamlaszam": string;
  };
  vevo: {
    "[f-12] cegnev": string;
    cim: {
      "[f-16] orszag": string;
      "[f-13] telepules": string;
      "[f-15] iranyitoszam": string;
      "[f-14] utca_hsz": string;
    };
    "[f-17] adoszam": string;
    "[f-18] kozossegi_adoszam": string;
  };
  datumok: {
    "[f-22] szamla_kelte": string;
    "[f-23] teljesites_datuma": string;
    "[f-24] fizetesi_feltetel": string;
    "[f-25] fizetesi_hatarido": string;
  };
  tetel: Array<{
    "[f-26] I6_cikkszam": string;
    "[f-27] termek_megnevezes": string;
    "[f-28] DJI_cikkszam": string;
    "[f-29] EAN": string;
    "[f-30] mennyiseg": number;
    "[f-31] egyseg_ar": number;
    "[f-32] netto_ar": number;
    ado: {
      "[f-33] mertek": string;
      "[f-39] ado_alap": number;
      "[f-34] osszeg": number;
    };
    "[f-35] brutto_ar": number;
  }>;
  osszegek: {
    "[f-36] netto_osszeg": number;
    "[f-40] ado_osszeg": number;
    "[f-37] brutto_osszeg": number;
    "[f-38] fizetendo_osszeg": number;
  };
  "[f-41] szamla_megjegyezesek": string;
  szamla_design: {
    szamla_lablec: {
      elerhetoseg: {
        "[f-42] honlap": string;
        "[f-43] email": string;
        "[f-44] telefon": string;
      };
    };
    szamla_fejlec: {
      logo: string;
    };
  };
  "[f-45] oldal": string;
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  return textContent.items.map((item: any) => item.str).join('\n');
};

export const convertTextToJson = (text: string): InvoiceData => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
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

  // Process lines
  let currentSection = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() || '';

    // Kibocsátó adatai
    if (line.startsWith('WESTech')) {
      invoiceData.kibocsato["[f-04] cegnev"] = line;
      // Keressük meg a címadatokat a következő sorokban
      let addressFound = false;
      for (let j = i + 1; j < i + 5 && j < lines.length; j++) {
        const addressLine = lines[j]?.trim() || '';
        if (addressLine.includes('Váci út')) {
          invoiceData.kibocsato.cim["[f-06] utca_hsz"] = addressLine;
          addressFound = true;
        } else if (addressFound && addressLine.includes('Budapest')) {
          const parts = addressLine.split(' ');
          invoiceData.kibocsato.cim["[f-05] telepules"] = parts[0] || '';
          invoiceData.kibocsato.cim["[f-07] iranyitoszam"] = parts[1] || '';
        } else if (addressFound && addressLine === 'Magyarország') {
          invoiceData.kibocsato.cim["[f-08] orszag"] = addressLine;
          i = j; // Frissítsük a fő ciklus indexét
          break;
        }
      }
      currentSection = 'kibocsato';
      continue;
    }

    // Számla sorszám
    if (line.includes('INV')) {
      const parts = line.split('/');
      invoiceData.szamla_szam["[f-01] szla_prefix"] = parts[0] || '';
      invoiceData.szamla_szam["[f-02] szla_year"] = parts[1] || '';
      invoiceData.szamla_szam["[f-03] ODU_szamlaszam"] = parts[2] || '';
      continue;
    }

    // Vevő adatai
    if (line === 'VEVŐ') {
      currentSection = 'vevo';
      continue;
    }

    // Dátumok
    if (line.startsWith('SZÁMLA KELTE:')) {
      invoiceData.datumok["[f-22] szamla_kelte"] = line.split(':')[1]?.trim() || '';
      continue;
    }
    if (line.startsWith('TELJESÍTÉS DÁTUMA:')) {
      invoiceData.datumok["[f-23] teljesites_datuma"] = line.split(':')[1]?.trim() || '';
      continue;
    }
    if (line.startsWith('FIZETÉSI FELTÉTEL:')) {
      invoiceData.datumok["[f-24] fizetesi_feltetel"] = line.split(':')[1]?.trim() || '';
      continue;
    }
    if (line.startsWith('FIZETÉSI HATÁRIDŐ:')) {
      invoiceData.datumok["[f-25] fizetesi_hatarido"] = line.split(':')[1]?.trim() || '';
      continue;
    }

    // Tételek
    if (line === 'Leírás') {
      currentSection = 'tetel';
      continue;
    }

    // Összegek
    if (line === 'Nettó összeg') {
      invoiceData.osszegek["[f-36] netto_osszeg"] = parseFloat(lines[++i]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      continue;
    }
    if (line === 'Összesen') {
      invoiceData.osszegek["[f-37] brutto_osszeg"] = parseFloat(lines[++i]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      continue;
    }
    if (line === 'FIZETENDŐ ÖSSZEG') {
      invoiceData.osszegek["[f-38] fizetendo_osszeg"] = parseFloat(lines[++i]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      continue;
    }

    // Láblec
    if (line.startsWith('http')) {
      invoiceData.szamla_design.szamla_lablec.elerhetoseg["[f-42] honlap"] = line;
      invoiceData.szamla_design.szamla_lablec.elerhetoseg["[f-43] email"] = lines[++i]?.trim() || '';
      invoiceData.szamla_design.szamla_lablec.elerhetoseg["[f-44] telefon"] = lines[++i]?.trim() || '';
      continue;
    }

    // Oldalszám
    if (line.includes('/')) {
      invoiceData["[f-45] oldal"] = line;
      continue;
    }

    // Section-specific processing
    switch (currentSection) {
      case 'kibocsato':
        if (line.startsWith('Adószám:')) {
          invoiceData.kibocsato["[f-09] adoszam"] = line.split(':')[1]?.trim() || '';
        } else if (line.startsWith('Bankszámla:')) {
          invoiceData.kibocsato.bankszamla["[f-10] szamlaszam"] = line.split(':')[1]?.trim() || '';
          invoiceData.kibocsato.bankszamla["[f-11] bank"] = lines[++i]?.trim() || '';
        } else if (line.startsWith('Forrás:')) {
          const parts = line.split(' ');
          invoiceData.kibocsato["[f-19] ODU_rendeles_szam"] = parts[1] || '';
          invoiceData.kibocsato["[f-20] I6_rendeles_szam"] = parts[2] || '';
        } else if (line.startsWith('Referencia:')) {
          invoiceData.kibocsato["[f-21] I6_szamlaszam"] = line.split(':')[1]?.trim() || '';
        }
        break;
      case 'vevo':
        if (!invoiceData.vevo["[f-12] cegnev"]) {
          invoiceData.vevo["[f-12] cegnev"] = line;
        } else if (!invoiceData.vevo.cim["[f-14] utca_hsz"]) {
          invoiceData.vevo.cim["[f-14] utca_hsz"] = line;
        } else if (!invoiceData.vevo.cim["[f-13] telepules"]) {
          const parts = line.split(' ');
          invoiceData.vevo.cim["[f-15] iranyitoszam"] = parts[0] || '';
          invoiceData.vevo.cim["[f-13] telepules"] = parts.slice(1).join(' ');
        } else if (!invoiceData.vevo.cim["[f-16] orszag"]) {
          invoiceData.vevo.cim["[f-16] orszag"] = line;
        } else if (line.startsWith('Adószám:')) {
          invoiceData.vevo["[f-17] adoszam"] = line.split(':')[1]?.trim() || '';
        } else if (line.startsWith('Közösségi adószám:')) {
          invoiceData.vevo["[f-18] kozossegi_adoszam"] = line.split(':')[1]?.trim() || '';
        }
        break;
      case 'tetel':
        if (line.includes('Mennyiség') || line.includes('Egységár')) {
          break;
        }
        const tetel = {
          "[f-26] I6_cikkszam": line,
          "[f-27] termek_megnevezes": lines[++i]?.trim() || '',
          "[f-28] DJI_cikkszam": (lines[++i]?.split(':')[1] || '').trim(),
          "[f-29] EAN": (lines[++i]?.split(':')[1] || '').trim(),
          "[f-30] mennyiseg": parseFloat(lines[++i] || '0') || 0,
          "[f-31] egyseg_ar": parseFloat((lines[++i] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
          "[f-32] netto_ar": parseFloat((lines[++i] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
          ado: {
            "[f-33] mertek": lines[++i] || '',
            "[f-39] ado_alap": 0,
            "[f-34] osszeg": parseFloat((lines[++i] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0
          },
          "[f-35] brutto_ar": parseFloat((lines[++i] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0
        };
        tetel.ado["[f-39] ado_alap"] = tetel["[f-32] netto_ar"];
        invoiceData.tetel.push(tetel);
        break;
    }
  }

  // Calculate total VAT
  invoiceData.osszegek["[f-40] ado_osszeg"] = invoiceData.tetel.reduce((sum, item) => sum + item.ado["[f-34] osszeg"], 0);

  // Extract logo information (assuming it's a constant path)
  invoiceData.szamla_design.szamla_fejlec.logo = "/public/Westech_invoice_logo.png";

  return invoiceData;
};

export const processInvoice = async (file: File): Promise<InvoiceData> => {
  try {
    const text = await extractTextFromPDF(file);
    const jsonData = convertTextToJson(text);
    return jsonData;
  } catch (error) {
    console.error("Hiba történt a számla feldolgozása során:", error);
    throw error;
  }
};