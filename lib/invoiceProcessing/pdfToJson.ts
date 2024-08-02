import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = '';
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const content = await page.getTextContent();
    content.items.forEach((item: any) => {
      text += item.str + '\n';
    });
  }
  return text;
}

export function convertTextToJson(text: string): any {
  const data: any = {};

  data['szamla_szam'] = text.match(/Számla INV\/(\d+\/\d+)/)?.[1] || '';
  data['kibocsato'] = {
    cegnev: text.match(/KIBOCSÁTÓ\n(.*?)\n/)?.[1]?.trim() || '',
    cim: text.match(/KIBOCSÁTÓ\n.*?\n(.*?)\n(.*?)\n/)?.slice(1, 3)?.join(', ').trim() || '',
    adoszam: text.match(/Adószám: (\d+-\d+-\d+)/)?.[1] || '',
    bankszamla: {
      szamlaszam: text.match(/Bankszámla: (\w+)/)?.[1] || '',
      bank: 'K&H Bank Zrt.'
    }
  };

  data['vevo'] = {
    cegnev: text.match(/VEVŐ\n(.*?)\n/)?.[1]?.trim() || '',
    cim: text.match(/VEVŐ\n.*?\n(.*?)\n(.*?)\n/)?.slice(1, 3)?.join(', ').trim() || '',
    adoszam: text.match(/Adószám: (\d+-\d+-\d+)/)?.[1] || '',
    kozossegi_adoszam: text.match(/Közösségi adószám: (\d+-\d+-\d+)/)?.[1] || ''
  };

  data['forras'] = text.match(/Forrás:\s*(\S+)/)?.[1] || '';
  data['referencia'] = text.match(/Referencia:\s*(\S+)/)?.[1] || '';

  data['datumok'] = {
    szamla_kelte: text.match(/SZÁMLA KELTE:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || '',
    teljesites_datuma: text.match(/TELJESÍTÉS DÁTUMA:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || '',
    fizetesi_feltetel: text.match(/FIZETÉSI FELTÉTEL:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || '',
    fizetesi_hatarido: text.match(/FIZETÉSI HATÁRIDŐ:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || ''
  };

  const items = [];
  const itemRegex = /Leírás\n(.*?)\nMennyiség\n(.*?)\nEgységár\n(.*?)\nNettó ár\n(.*?)\nAdó\n(.*?)\nAdó összege\n(.*?)\nBruttó ár\n(.*?)\n/g;
  let match;
  while ((match = itemRegex.exec(text)) !== null) {
    items.push({
      leiras: match[1]?.trim() || '',
      mennyiseg: parseFloat(match[2]?.replace(',', '.') || '0'),
      egyseg_ar: parseInt(match[3]?.replace(/\./g, '').replace(',', '') || '0'),
      netto_ar: parseInt(match[4]?.replace(/\./g, '').replace(',', '') || '0'),
      ado: {
        kulcs: parseInt(match[5]?.replace('%', '') || '0'),
        osszege: parseInt(match[6]?.replace(/\./g, '').replace(',', '') || '0')
      },
      brutto_ar: parseInt(match[7]?.replace(/\./g, '').replace(',', '') || '0')
    });
  }
  data['tetel'] = items;

  data['osszegek'] = {
    netto_osszeg: parseInt(text.match(/Nettó összeg\s*(\S+)/)?.[1]?.replace(/\./g, '').replace(',', '') || '0'),
    osszesen: parseInt(text.match(/Összesen\s*(\S+)/)?.[1]?.replace(/\./g, '').replace(',', '') || '0'),
    fizetendo_osszeg: parseInt(text.match(/FIZETENDŐ ÖSSZEG\s*(\S+)/)?.[1]?.replace(/\./g, '').replace(',', '') || '0')
  };

  const taxDetails = text.match(/Adó Adó alapja Összeg\n(\d+%) (\S+) (\S+)/)?.slice(1);
  data['ado_reszletek'] = {
    [taxDetails?.[0] || '']: {
      ado_alapja: parseInt(taxDetails?.[1]?.replace(/\./g, '').replace(',', '') || '0'),
      osszeg: parseInt(taxDetails?.[2]?.replace(/\./g, '').replace(',', '') || '0')
    }
  };

  data['megjegyzesek'] = text.match(/Megjegyzések:\n(.*)/s)?.[1]?.trim() || '';

  return data;
}
