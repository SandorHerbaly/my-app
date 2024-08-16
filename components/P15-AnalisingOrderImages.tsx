"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IntervalCalendar from './P14a-IntervallumCalendar'; // Ezt a részt módosíthatod P15-re, ha külön naptárat használsz
import { storage, db } from '@/lib/firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { GrDocumentPdf } from "react-icons/gr";
import { format } from "date-fns";
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// Ha van P15b verifikációs komponens, itt módosítsd
import { P14b } from './P14b-InvoiceDataVerification'; 

interface OrderFile {
  name: string;
  url: string;
  isImported: boolean;
  verificationStatus: 'pending' | 'verified' | 'error';
}

export const P15AnalisingOrderImages: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [orderFiles, setOrderFiles] = useState<OrderFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isSearchButtonEnabled, setIsSearchButtonEnabled] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [isAnalyzeButtonEnabled, setIsAnalyzeButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

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
  
    setOrderFiles([]);
    setIsSearchButtonEnabled(false);
    setHasSearched(true);
    setNoResults(false);
    setIsLoading(true);
  
    try {
      const storageRef = ref(storage, 'orders'); // 'invoices' helyett 'orders'
      const fileList = await listAll(storageRef);
  
      const filteredFiles = await Promise.all(
        fileList.items
          .filter(item => item.name.endsWith('.pdf'))
          .map(async (item) => {
            const fileName = item.name;
            const match = fileName.match(/ORD_(\d{4})_(\d{2})/); // 'INV' helyett 'ORD'
            if (match) {
              const fileYearMonth = `${match[1]}_${match[2]}`;
              if (fileYearMonth >= startMonth && fileYearMonth <= endMonth) {
                const url = await getDownloadURL(item);
                const docRef = doc(db, 'AI-Orders', fileName); // 'AI-Invoices' helyett 'AI-Orders'
                const docSnap = await getDoc(docRef);
                const isImported = docSnap.exists();
                return { name: fileName, url, isImported };
              }
            }
            return null;
          })
      );
  
      const validFiles = filteredFiles.filter((file): file is OrderFile => file !== null);
      setOrderFiles(validFiles);
  
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
    setSelectedFiles(isChecked ? orderFiles.map(file => file.name) : []);
  }, [orderFiles]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFiles.length) return;
    setIsLoading(true);
    setIsModalOpen(true);
    setProgressValue(0);
    setCurrentFileIndex(0);
    console.log(`Starting analysis for ${selectedFiles.length} files`);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileName = selectedFiles[i];
        setCurrentFileIndex(i + 1);
        console.log(`Processing file: ${fileName}`);
        const response = await fetch('/api/analyze-order', { // '/api/analyze-invoice' helyett '/api/analyze-order'
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filename: fileName }),
        });
    
        if (!response.ok) {
          console.error(`Error response for file ${fileName}: ${response.status} ${response.statusText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const result = await response.json();
        console.log(`Successfully analyzed file: ${fileName}`);
    
        const parsedJson = JSON.parse(result.text);
        const formattedJson = JSON.stringify(parsedJson, null, 2);
        console.log('Raw response:', formattedJson);
    
        setProgressValue(((i + 1) / selectedFiles.length) * 100);
      }
    } catch (error) {
      console.error("Error analyzing orders:", error);
      toast.error('Hiba történt a megrendelések elemzésekor');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      console.log('Analysis process completed');
    }
  }, [selectedFiles]);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">P15-Megrendelés képek elemzése és JSON fájl generálása, mentése</CardTitle>
            <Button
              onClick={handleAnalyze}
              disabled={!isAnalyzeButtonEnabled || isLoading}
            >
              {isLoading ? 'Feldolgozás...' : 'Megrendelések elemzése, konvertálás JSON-ba'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-lg font-semibold">Megrendelések keresése időintervallum alapján</p>
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
              orderFiles.length > 0 ? (
                <div className="overflow-auto border rounded">
                  <table className="border-collapse w-full">
                    <thead style={{ backgroundColor: '#E4E8F2', height: '45px' }}>
                      <tr>
                        <th className="px-4 py-2 text-left">
                          <Checkbox
                            id="select-all"
                            onCheckedChange={(isChecked) => handleSelectAll(isChecked as boolean)}
                            checked={selectedFiles.length === orderFiles.length && orderFiles.length > 0}
                            className="h-5 w-5"
                          />
                        </th>
                        <th className="px-4 py-2 text-left">Megrendelések ({orderFiles.length})</th>
                        <th className="px-4 py-2 text-left">Státusz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderFiles.map((file, index) => (
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
                          <td className="px-4 py-2 align-middle">
                            <P14b 
                              fileName={file.name}
                              isImported={file.isImported}
                              verificationStatus={file.verificationStatus}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                noResults && <p className="text-red-500">A megadott időintervallumban nem található megrendelés.</p>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elemzés folyamatban</DialogTitle>
            <DialogDescription>Kis türelmet, a fájlok elemzése folyamatban van...</DialogDescription>
          </DialogHeader>
          <p className="text-center mt-4">{currentFileIndex}/{selectedFiles.length}</p>
          <Progress value={progressValue} className="mt-2" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default P15AnalisingOrderImages;
