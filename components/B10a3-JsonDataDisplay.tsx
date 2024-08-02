import React from 'react';
import { Button } from '@/components/ui/button';

const fixedJsonData = {
  "szamla_szam": {
    "szla_prefix": "INV",
    "szla_year": "2024",
    "ODU_szamlaszam": "01507"
  },
  "kibocsato": {
    "cegnev": "WESTech HU Kft.",
    "cim": {
      "orszag": "Magyarország",
      "telepules": "Budapest",
      "iranyitoszam": "1139",
      "utca_hsz": "Váci út 91. IV. emelet"
    },
    "adoszam": "23807341-2-41",
    "bankszamla": {
      "szamlaszam": "HU20 1040 2166 5052 7066 8453 1004",
      "bank": "K&H Bank Zrt."
    },
    "ODU_rendeles_szam": "S02237",
    "I6_rendeles_szam": "COR2400931",
    "I6_szamlaszam": "2401507"
  },
  "vevo": {
    "cegnev": "Dronesys Kft.",
    "cim": {
      "orszag": "Magyarország",
      "telepules": "Dunakeszi",
      "iranyitoszam": "2120",
      "utca_hsz": "Lehár Ferenc utca 54. A. ép."
    },
    "adoszam": "25349670-2-13"
  },
  "datumok": {
    "szamla_kelte": "2024-07-30",
    "teljesites_datuma": "2024-07-30",
    "fizetesi_feltetel": "",
    "fizetesi_hatarido": "2024-08-19"
  },
  "tetel": [
    {
      "I6_cikkszam": "GTDJICPFP000015101HU",
      "termek_megnevezes": "DJI Avata 2 Fly More Combo (Three Batteries)",
      "DJI_cikkszam": "CP.FP.00000151.01",
      "EAN": "6941565980120",
      "mennyiseg": 4,
      "egyseg_ar": 370156.00,
      "netto_ar": 1480624.00,
      "ado": {
        "mertek": "27%",
        "ado_alap": 1480624.00,
        "osszeg": 399768.00
      },
      "brutto_ar": 1880392.00
    }
  ],
  "osszegek": {
    "netto_osszeg": 1480624.00,
    "ado_osszeg": 399768.00,
    "brutto_osszeg": 1880392.00,
    "fizetendo_osszeg": 1880392.00
  },
  "szamla_megjegyezesek": "",
  "szamla_design": {
    "szamla_lablec": {
      "elerhetoseg": {
        "honlap": "https://online.westech.hu",
        "email": "info@westech.hu",
        "telefon": "+36 30 148 4883"
      }
    },
    "szamla_fejlec": {
      "logo": "/public/Westech_invoice_logo.png"
    }
  }
};

interface B10a3JsonDataDisplayProps {
  onClonePreview: (data: any) => void;
}

const B10a3JsonDataDisplay: React.FC<B10a3JsonDataDisplayProps> = ({ onClonePreview }) => {
  const handleClonePreview = () => {
    onClonePreview(fixedJsonData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Invoice Data</h3>
        <Button onClick={handleClonePreview}>Clone Preview</Button>
      </div>
      <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        <pre>{JSON.stringify(fixedJsonData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default B10a3JsonDataDisplay;