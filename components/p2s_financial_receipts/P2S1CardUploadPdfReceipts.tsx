import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Download } from 'lucide-react';
import { storage, db } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import P2S3PdfViewerDialog from './P2S3PdfViewerDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-grow">
        <div>
          <CardTitle className="text-2xl font-medium">{title}</CardTitle>
          <span className="text-3xl font-bold block mt-2">{count}</span>
        </div>
      </CardHeader>
      <CardContent className="mt-auto">
        <p className="text-xs text-muted-foreground mb-4">
          {count > 0 ? `Last upload: ${lastUpload}` : 'There is no uploaded pdf'}
        </p>
        <Button
          onClick={() => document.getElementById(`fileInput-${title}`)?.click()}
          className="w-full"
        >
          <FileUp className="mr-2 h-4 w-4" /> Upload {title ? title.toLowerCase() : 'file'}
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
    Invoices: 7,
    'WSK Invoices': 0,
    'Bank Statements': 0
  });
  const [lastUploadDate, setLastUploadDate] = useState('August 25, 2024 at 07:46:43 AM, Emily Parker');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [totalPdfCount, setTotalPdfCount] = useState(7);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  useEffect(() => {
    setTotalPdfCount(Object.values(uploadCounts).reduce((a, b) => a + b, 0));
  }, [uploadCounts]);

  const fetchRecentUploads = async () => {
    const allFiles = [];
    for (const collectionName of ['UploadedPdfOrders', 'UploadedPdfInvoices', 'UploadedWskInvoices', 'UploadedBankStatements']) {
      const q = query(collection(db, collectionName), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allFiles.push({ id: doc.id, ...doc.data() });
      });
    }
    allFiles.sort((a, b) => b.uploadedAt.toDate() - a.uploadedAt.toDate());
    setUploadedFiles(allFiles);
    
    if (allFiles.length > 0) {
      setLastUploadDate(formatDate(allFiles[0].uploadedAt, true));
    }

    const counts = {
      Orders: 0,
      Invoices: 0,
      'WSK Invoices': 0,
      'Bank Statements': 0
    };
    allFiles.forEach(file => {
      counts[file.type]++;
    });
    setUploadCounts(counts);
  };

  const formatDate = (dateValue: any, includeSeconds: boolean = false): string => {
    let date: Date;
    if (dateValue instanceof Timestamp) {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined
    }) + ", Emily Parker";
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
          uploaded: formatDate(now, true)
        };

        newUploadedFiles.push(newFile);
      } catch (error) {
        console.error("Error uploading file: ", error);
      }
    }

    setUploadedFiles(prevFiles => [...newUploadedFiles, ...prevFiles]);
    setLastUploadDate(formatDate(new Date(), true));

    if (onUploadComplete) {
      onUploadComplete(newUploadedFiles);
    }

    fetchRecentUploads();
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

  const getAIStatusBadge = (status: string) => {
    let variant = "outline";
    if (status === "Analysed") {
      variant = "secondary";
    }
    return <Badge variant={variant}>{status}</Badge>;
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
      
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setActiveTab('all')}>All</TabsTrigger>
            <TabsTrigger value="orders" onClick={() => setActiveTab('orders')}>Orders</TabsTrigger>
            <TabsTrigger value="invoices" onClick={() => setActiveTab('invoices')}>Invoices</TabsTrigger>
            <TabsTrigger value="wsk invoices" onClick={() => setActiveTab('wsk invoices')}>WSK Invoices</TabsTrigger>
            <TabsTrigger value="bank statements" onClick={() => setActiveTab('bank statements')}>Bank Statements</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
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
      </Tabs>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">All Uploaded PDF receipts ({totalPdfCount})</h3>
        <p className="text-sm text-muted-foreground mb-4">Last upload: {lastUploadDate}</p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>AI Status</TableHead>
              <TableHead>Upload Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploadedFiles
              .filter(file => activeTab === 'all' || file.type.toLowerCase().includes(activeTab))
              .map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.name}</TableCell>
                  <TableCell>{file.type}</TableCell>
                  <TableCell>{getAIStatusBadge(file.aiStatus)}</TableCell>
                  <TableCell>{formatDate(file.uploadedAt, true)}</TableCell>
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