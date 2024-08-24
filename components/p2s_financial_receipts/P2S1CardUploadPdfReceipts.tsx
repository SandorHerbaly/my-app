"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Download } from 'lucide-react';
import { storage, db } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import P2S3PdfViewerDialog from './P2S3PdfViewerDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    Invoices: 2,
    'WSK Invoices': 0,
    'Bank Statements': 0
  });
  const [lastUploadDate, setLastUploadDate] = useState('August 24, 2024 at 08:38 PM');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [totalPdfCount, setTotalPdfCount] = useState(2);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const unsubscribes = Object.entries(uploadCounts).map(([title, _]) => {
      const collectionName = getCollectionName(title);
      return onSnapshot(collection(db, collectionName), (snapshot) => {
        setUploadCounts(prev => ({
          ...prev,
          [title]: snapshot.size
        }));
      });
    });

    fetchRecentUploads();

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, []);

  useEffect(() => {
    setTotalPdfCount(Object.values(uploadCounts).reduce((a, b) => a + b, 0));
  }, [uploadCounts]);

  const fetchRecentUploads = async () => {
    const allFiles = [];
    for (const collectionName of ['UploadedPdfOrders', 'UploadedPdfInvoices', 'UploadedWskInvoices', 'UploadedBankStatements']) {
      const q = query(collection(db, collectionName), orderBy('uploadedAt', 'desc'), limit(2));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allFiles.push({ id: doc.id, ...doc.data() });
      });
    }
    allFiles.sort((a, b) => b.uploadedAt.toDate() - a.uploadedAt.toDate());
    setUploadedFiles(allFiles.slice(0, 2));
    
    if (allFiles.length > 0) {
      setLastUploadDate(formatDate(allFiles[0].uploadedAt.toDate(), true));
    }
  };

  const formatDate = (date: Date, includeSeconds: boolean = false): string => {
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined
    });
  };

  const handleUpload = async (files: FileList, type: string) => {
    const newUploadedFiles = [];
    const collectionName = getCollectionName(type);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(storage, `${collectionName}/${file.name}`);
      
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        const now = new Date();

        const docRef = await addDoc(collection(db, collectionName), {
          name: file.name,
          url: downloadURL,
          type: type,
          aiStatus: 'Not Analysed',
          uploadedBy: 'Emily Parker',
          uploadedAt: serverTimestamp()
        });

        const newFile = {
          id: docRef.id,
          name: file.name,
          url: downloadURL,
          type: type,
          aiStatus: 'Not Analysed',
          uploadedAt: now,
          uploaded: formatDate(now, true) + ", Emily Parker"
        };

        newUploadedFiles.push(newFile);
      } catch (error) {
        console.error("Error uploading file: ", error);
      }
    }

    setUploadedFiles(prevFiles => [...newUploadedFiles, ...prevFiles].sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, 2));
    setLastUploadDate(formatDate(new Date(), true));

    if (onUploadComplete) {
      onUploadComplete(newUploadedFiles);
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
    <>
      <h2 className="text-3xl font-bold mb-6">Upload Financial Receipts</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
      
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="wsk invoices">Pro-Forma Invoices</TabsTrigger>
            <TabsTrigger value="bank statements">Bank Statements</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Uploaded PDF receipts ({totalPdfCount})</h3>
          <p className="text-sm text-muted-foreground">Last upload: {lastUploadDate}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>AI Status</TableHead>
              <TableHead>Uploaded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploadedFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{file.name}</TableCell>
                <TableCell>{file.type}</TableCell>
                <TableCell>{file.aiStatus}</TableCell>
                <TableCell>{file.uploaded}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {selectedPdf && (
        <P2S3PdfViewerDialog 
          pdfUrl={selectedPdf} 
          onClose={() => setSelectedPdf(null)} 
        />
      )}
    </>
  );
};

export default P2S1CardUploadPdfReceipts;