"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp } from 'lucide-react';
import { storage, db } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface UploadCardProps {
  title: string;
  count: number;
  lastUpload: string;
  onUpload: (files: FileList) => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ title, count, lastUpload, onUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onUpload(event.target.files);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-2xl font-bold">{count}</span>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">Last upload: {lastUpload}</p>
        <Button
          onClick={() => document.getElementById(`fileInput-${title}`)?.click()}
          className="w-full mt-2"
        >
          <FileUp className="mr-2 h-4 w-4" /> Upload {title.toLowerCase()}
        </Button>
        <input
          id={`fileInput-${title}`}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </CardContent>
    </Card>
  );
};

interface P2S1CardUploadPdfReceiptsProps {
  onUploadComplete?: (newFiles: any[]) => void;
}

const P2S1CardUploadPdfReceipts: React.FC<P2S1CardUploadPdfReceiptsProps> = ({ onUploadComplete }) => {
  const [uploadCounts, setUploadCounts] = useState({
    Orders: 0,
    Invoices: 0,
    'WSK Invoices': 0,
    'Bank Statements': 0
  });
  const [lastUploadDate, setLastUploadDate] = useState('');

  useEffect(() => {
    // Itt lehetne lekérni a valós adatokat a Firebase-ből
    setLastUploadDate("Friday, August 23, 2024, 3:55 PM");
  }, []);

  const handleUpload = async (files: FileList, type: string) => {
    const uploadedFiles = [];
    const collectionName = getCollectionName(type);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(storage, `${collectionName}/${file.name}`);
      
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const docRef = await addDoc(collection(db, collectionName), {
          name: file.name,
          url: downloadURL,
          type: type,
          aiStatus: 'Not Analysed',
          uploadedBy: 'Emily Parker',
          uploadedAt: serverTimestamp()
        });

        uploadedFiles.push({
          id: docRef.id,
          name: file.name,
          url: downloadURL,
          type: type,
          aiStatus: 'Not Analysed',
          uploaded: `${new Date().toLocaleString()}, Emily Parker`
        });

        setUploadCounts(prev => ({
          ...prev,
          [type]: prev[type] + 1
        }));
        setLastUploadDate(new Date().toLocaleString());
      } catch (error) {
        console.error("Error uploading file: ", error);
      }
    }

    if (onUploadComplete) {
      onUploadComplete(uploadedFiles);
    }
  };

  const getCollectionName = (type: string): string => {
    switch (type) {
      case 'Orders': return 'UploadedPdfOrders';
      case 'Invoices': return 'UploadedPdfInvoices';
      case 'WSK Invoices': return 'UploadedWskInvoices';
      case 'Bank Statements': return 'UploadedBankStatements';
      default: return 'UploadedPdfInvoices';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Object.entries(uploadCounts).map(([title, count]) => (
        <UploadCard
          key={title}
          title={title}
          count={count}
          lastUpload={lastUploadDate}
          onUpload={(files) => handleUpload(files, title)}
        />
      ))}
    </div>
  );
};

export default P2S1CardUploadPdfReceipts;