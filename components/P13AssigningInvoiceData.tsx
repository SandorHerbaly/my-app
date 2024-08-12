'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { storage } from '@/lib/firebase.config';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const P13AssigningInvoiceData: React.FC = () => {
  const [pngUrls, setPngUrls] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [jsonTemplate, setJsonTemplate] = useState<string>('');
  const searchParams = useSearchParams();
  const fileName = searchParams.get('fileName');

  useEffect(() => {
    const fetchPngUrls = async () => {
      if (fileName) {
        const storageRef = ref(storage, 'invoices');
        const filePrefix = fileName.replace('.pdf', '');
        try {
          const result = await listAll(storageRef);
          const filteredItems = result.items.filter(item => 
            item.name.startsWith(filePrefix) && item.name.endsWith('.png')
          );
          const urls = await Promise.all(
            filteredItems.map(async item => await getDownloadURL(item))
          );
          setPngUrls(urls);
          setFileNames(filteredItems.map(item => item.name));
        } catch (error) {
          console.error("Hiba a képek betöltése során:", error);
        }
      }
    };

    fetchPngUrls();
  }, [fileName]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonTemplate(content);
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonTemplate(event.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Számlaadatok kijelölése</h1>
      <div className="flex">
        <div className="w-1/2 pr-2">
          <div className="border rounded-lg overflow-hidden">
            <div className="h-[calc(100vh-200px)] overflow-y-auto p-4">
              {pngUrls.length > 0 ? (
                pngUrls.map((url, index) => (
                  <div key={index} className="mb-8 last:mb-0">
                    <h2 className="text-lg font-semibold mb-2">{fileNames[index]}</h2>
                    <img src={url} alt={`Számla oldal ${index + 1}`} className="w-full h-auto" />
                  </div>
                ))
              ) : (
                <p>Nincsenek betöltött képek vagy a betöltés folyamatban van...</p>
              )}
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-2">
          <div className="border rounded-lg h-[calc(100vh-200px)] p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">JSON adatsablon feltöltése</h2>
            <div className="mb-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="json-file-upload"
              />
              <Button asChild>
                <label htmlFor="json-file-upload">JSON fájl feltöltése</label>
              </Button>
            </div>
            <div className="mb-4">
              <Textarea
                placeholder="Vagy illessze be ide a JSON adatsablont..."
                onChange={handlePaste}
                value={jsonTemplate}
                className="h-40"
              />
            </div>
            {jsonTemplate && (
              <div>
                <h3 className="text-md font-semibold mb-2">Feltöltött JSON adatsablon:</h3>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                  {jsonTemplate}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};