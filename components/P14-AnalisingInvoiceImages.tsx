"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IntervalCalendar from './P14a-IntervallumCalendar';
import { storage } from '@/lib/firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { Checkbox } from "@/components/ui/checkbox";
import { GrDocumentPdf } from "react-icons/gr";
import { format } from "date-fns";
import { toast } from 'sonner'; // Feltételezve, hogy használod a sonner könyvtárat

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
  const [isAnalyzeButtonEnabled, setIsAnalyzeButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSearchButtonEnabled(!!startDate && !!endDate);
    setHasSearched(false);
    setIsAnalyzeButtonEnabled(false);
  }, [startDate, endDate]);

  useEffect(() => {
    setIsAnalyzeButtonEnabled(selectedFiles.length > 0);
  }, [selectedFiles]);

  const handleSearch = useCallback(async () => {
    if (!startDate || !endDate) return;

    const startMonth = format(startDate, 'yyyy_MM');
    const endMonth = format(endDate, 'yyyy_MM');

    setInvoiceFiles([]);
    setIsSearchButtonEnabled(false);
    setHasSearched(true);
    setNoResults(false);
    setIsLoading(true);

    try {
      const storageRef = ref(storage, 'invoices');
      const fileList = await listAll(storageRef);

      const filteredFiles = await Promise.all(
        fileList.items
          .filter(item => item.name.endsWith('.pdf'))
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
        setNoResults(true);
      }
    } catch (error) {
      console.error('Error retrieving files:', error);
      toast.error('Hiba történt a fájlok lekérdezésekor');
    } finally {
      setIsLoading(false);
      setIsSearchButtonEnabled(true);
    }
  }, [startDate, endDate]);

  const handleFileSelect = useCallback((fileName: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileName)
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  }, []);

  const handleSelectAll = useCallback((isChecked: boolean) => {
    setSelectedFiles(isChecked ? invoiceFiles.map(file => file.name) : []);
  }, [invoiceFiles]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFiles.length) return;
    setIsLoading(true);
  
    try {
      const analyzedInvoices = await Promise.all(
        selectedFiles.map(async (fileName) => {
          const response = await fetch('/api/analyze-invoice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: fileName }),
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          return await response.json();
        })
      );
  
      analyzedInvoices.forEach(response => {
        if (response?.text) {
          console.log(response.text);
        }
      });
  
      toast.success('Számlák elemzése sikeres');
    } catch (error) {
      console.error("Error analyzing invoices:", error);
      toast.error('Hiba történt a számlák elemzésekor');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles]);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">P14-Számlaképek elemzése és JSON fájl generálása, mentése</CardTitle>
            <Button
              onClick={handleAnalyze}
              disabled={!isAnalyzeButtonEnabled || isLoading}
            >
              {isLoading ? 'Feldolgozás...' : 'Számlák elemzése, konvertálás JSON-ba'}
            </Button>
          </div>
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
            isLoading={isLoading}
          />

          <div className="mt-6">
            {hasSearched && (
              invoiceFiles.length > 0 ? (
                <div className="overflow-auto border rounded">
                  <table className="border-collapse w-full">
                    <thead style={{ backgroundColor: '#E4E8F2', height: '45px' }}>
                      <tr>
                        <th className="px-4 py-2 text-left">
                          <Checkbox
                            id="select-all"
                            onCheckedChange={(isChecked) => handleSelectAll(isChecked as boolean)}
                            checked={selectedFiles.length === invoiceFiles.length && invoiceFiles.length > 0}
                            className="h-5 w-5"
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
                          style={{ height: '54px' }}
                        >
                          <td className="px-4 py-2 align-middle">
                            <Checkbox
                              id={`file-${index}`}
                              checked={selectedFiles.includes(file.name)}
                              onCheckedChange={() => handleFileSelect(file.name)}
                              className="h-5 w-5"
                            />
                          </td>
                          <td className="px-4 py-2 flex items-center space-x-2 align-middle" style={{ height: '54px' }}>
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