"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IntervalCalendar from './P14a-IntervallumCalendar';
import { storage } from '@/lib/firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { Checkbox } from "@/components/ui/checkbox";
import { GrDocumentPdf } from "react-icons/gr"; // Importáljuk az új PDF ikont
import { format } from "date-fns";

interface InvoiceFile {
  name: string;
  url: string;
}

export const P14AnalisingInvoiceImages: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [invoiceFiles, setInvoiceFiles] = useState<InvoiceFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isSearchButtonEnabled, setIsSearchButtonEnabled] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    // Ha az intervallum változik, engedélyezze a keresési gombot
    setIsSearchButtonEnabled(startDate !== undefined && endDate !== undefined);
    setHasSearched(false); // Reset hasSearched state when dates change
  }, [startDate, endDate]);

  const handleSearch = async () => {
    if (!startDate || !endDate) return;

    const startMonth = format(startDate, 'yyyy_MM');
    const endMonth = format(endDate, 'yyyy_MM');

    setInvoiceFiles([]); // Reset before new search
    setIsSearchButtonEnabled(false); // Keresés után a gomb inaktívvá tétele
    setHasSearched(true); // Indicate that a search has been performed
    setNoResults(false); // Reset noResults state

    try {
      const storageRef = ref(storage, 'invoices');
      const fileList = await listAll(storageRef);

      const filteredFiles = await Promise.all(
        fileList.items
          .filter(item => item.name.endsWith('.pdf')) // Szűrés PDF fájlokra
          .map(async (item) => {
            const fileName = item.name;
            const match = fileName.match(/INV_(\d{4})_(\d{2})/);
            if (match) {
              const fileYearMonth = `${match[1]}_${match[2]}`;
              if (fileYearMonth >= startMonth && fileYearMonth <= endMonth) {
                const url = await getDownloadURL(item);
                return { name: fileName, url };
              }
            }
            return null;
          })
      );

      const validFiles = filteredFiles.filter((file): file is InvoiceFile => file !== null);
      setInvoiceFiles(validFiles);

      if (validFiles.length === 0) {
        setNoResults(true); // Set noResults state if no files found
      }
    } catch (error) {
      console.error('Error retrieving files:', error);
    }
  };

  const handleFileSelect = (fileName: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileName)
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedFiles(invoiceFiles.map(file => file.name));
    } else {
      setSelectedFiles([]);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">P14-Számlaképek elemzése és JSON fájl generálása, mentése</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-lg font-semibold">Számlák keresése időintervallum alapján</p>
          <IntervalCalendar
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSearch={handleSearch}
            isSearchButtonVisible={isSearchButtonEnabled}
          />

          <div className="mt-6">
            {hasSearched && (
              invoiceFiles.length > 0 ? (
                <div className="overflow-auto border rounded">
                  <table className="border-collapse">
                    <thead style={{ backgroundColor: '#E4E8F2', height: '45px' }}>
                      <tr>
                        <th className="px-4 py-2 text-left">
                          <Checkbox
                            id="select-all"
                            onCheckedChange={(isChecked) => handleSelectAll(isChecked as boolean)}
                            checked={selectedFiles.length === invoiceFiles.length && invoiceFiles.length > 0}
                            className="h-5 w-5" // 20x20 méret
                          />
                        </th>
                        <th className="px-4 py-2 text-left">
                          Számlák ({invoiceFiles.length})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceFiles.map((file, index) => (
                        <tr
                          key={index}
                          className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          style={{ height: '54px' }} // Sor magassága beállítva 54px-re
                        >
                          <td className="px-4 py-2 align-middle">
                            <Checkbox
                              id={`file-${index}`}
                              checked={selectedFiles.includes(file.name)}
                              onCheckedChange={() => handleFileSelect(file.name)}
                              className="h-5 w-5" // 20x20 méret
                            />
                          </td>
                          <td className="px-4 py-2 flex items-center space-x-2 align-middle" style={{ height: '54px' }}> {/* Sor középre igazítva */}
                            <GrDocumentPdf className="h-6 w-6" style={{ color: '#4F617F' }} />
                            <span>{file.name}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                noResults && <p className="text-red-500">A megadott időintervallumban nem található számla.</p>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default P14AnalisingInvoiceImages;
