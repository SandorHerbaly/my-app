import React from 'react';
import { Button } from '@/components/ui/button';

interface InvoiceData {
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

interface B10a3JsonDataDisplayProps {
  onClonePreview: (data: any) => void;
  jsonData?: InvoiceData;
}

const B10a3JsonDataDisplay: React.FC<B10a3JsonDataDisplayProps> = ({ onClonePreview, jsonData }) => {
  const handleClonePreview = () => {
    if (jsonData) {
      onClonePreview(jsonData);
    } else {
      console.error("No invoice data available to clone");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Invoice Data</h3>
        <Button onClick={handleClonePreview} disabled={!jsonData}>Clone Preview</Button>
      </div>
      <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: '500px', overflowY: 'auto' }}>
        {jsonData ? (
          <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        ) : (
          <p>No invoice data available. Please upload and process a PDF invoice.</p>
        )}
      </div>
    </div>
  );
};

export default B10a3JsonDataDisplay;