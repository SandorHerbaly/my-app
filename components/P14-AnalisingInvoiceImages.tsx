"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IntervalCalendar from './P14a-IntervallumCalendar';

interface InvoiceFile {
  name: string;
  url: string;
}

export const P14AnalisingInvoiceImages: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [invoiceFiles, setInvoiceFiles] = useState<InvoiceFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleSearch = () => {
    console.log('Kezdő dátum:', startDate);
    console.log('Vég dátum:', endDate);
    // Itt valósíthatod meg a keresési logikát
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (endDate && date && isAfter(date, endDate)) {
      setEndDate(undefined);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
  };

  const isSearchButtonVisible = startDate !== undefined && endDate !== undefined;

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
            onStartDateChange={handleStartDateSelect}
            onEndDateChange={handleEndDateSelect}
            onSearch={handleSearch} // Új prop a keresési gomb kattintásához
            isSearchButtonVisible={isSearchButtonVisible} // Új prop a gomb állapotának kezeléséhez
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default P14AnalisingInvoiceImages;
