'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface InvoiceData {
  [key: string]: any;
}

interface AssignedData {
  fieldId: string;
  value: string;
}

const B12AssignInvoiceData: React.FC = () => {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  let invoiceData: InvoiceData;
  try {
    invoiceData = data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Hiba történt az adatok feldolgozása során:', error);
    invoiceData = {};
  }

  const [pngUrls, setPngUrls] = useState<string[]>([]);
  const [assignedData, setAssignedData] = useState<AssignedData[]>([]);

  // Számlakép URL-k betöltése (példa)
  useEffect(() => {
    setPngUrls([
      '/path/to/invoice-page1.png', // Példa az első oldal URL-jére
      '/path/to/invoice-page2.png'  // Példa a második oldal URL-jére
    ]);
  }, []);

  // A kijelölt adat hozzáadása a mentésre kerülő adatokhoz
  const handleDataSelect = (fieldId: string, value: string) => {
    setAssignedData([...assignedData, { fieldId, value }]);
  };

  // Kijelölt adat törlése
  const handleDataDelete = (index: number) => {
    setAssignedData(assignedData.filter((_, i) => i !== index));
  };

  return (
    <div className="flex mt-16">
      {/* Bal oldali számlakép */}
      <div className="w-1/2 p-4">
        {pngUrls.length > 0 ? (
          pngUrls.map((url, index) => (
            <div key={index} className="mb-4">
              <img src={url} alt={`Invoice page ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
            </div>
          ))
        ) : (
          <p>No invoice images available.</p>
        )}
      </div>

      {/* Jobb oldali mentésre kerülő adatok */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-semibold">Mentésre kerülő adatok ({assignedData.length})</h2>
        <ul>
          {assignedData.map((item, index) => (
            <li key={index} className="flex justify-between items-center mb-2">
              <span>{item.value} ({item.fieldId})</span>
              <button onClick={() => handleDataDelete(index)}>Törlés</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default B12AssignInvoiceData;