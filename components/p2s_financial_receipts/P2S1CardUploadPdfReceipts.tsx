import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Download, Trash2 } from 'lucide-react';
import { storage, db } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import P2S3PdfViewerDialog from './P2S3PdfViewerDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface UploadCardProps {
  title: string;
  count: number;
  lastUpload: string;
  onUpload: (files: FileList) => Promise<void>;
}

const UploadCard: React.FC<UploadCardProps> = ({ title, count, lastUpload, onUpload }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsUploading(true);
      setTotalFiles(event.target.files.length);
      try {
        await onUpload(event.target.files);
      } catch (error) {
        console.error("Error during upload:", error);
        toast({
          title: "Upload Error",
          description: "An error occurred during the upload process.",
          variant: "destructive",
        });
      }
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-grow pb-2">
        <CardTitle className="text-2xl font-medium">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {count > 0 ? `Last upload: ${lastUpload}` : 'There is no uploaded pdf'}
        </p>
        <span className="text-3xl font-bold block mt-2">{count}</span>
      </CardHeader>
      <CardContent className="mt-auto">
        <Progress value={uploadProgress} className="w-full mb-2" />
        {isUploading ? (
          <p className="text-sm font-semibold text-blue-600 mb-2">
            Uploading file {currentFileIndex} of {totalFiles}
          </p>
        ) : null}
        <Button
          onClick={() => document.getElementById(`fileInput-${title}`)?.click()}
          className="w-full"
          disabled={isUploading}
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
    Orders: 2,
    Invoices: 6,
    'WSK Invoices': 0,
    'Bank Statements': 2,
  });
  const [lastUploadDate, setLastUploadDate] = useState('August 25, 2024 at 01:33:32 PM, Emily Parker');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [totalPdfCount, setTotalPdfCount] = useState(10);
  const [activeTab, setActiveTab] = useState('all');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  useEffect(() => {
    const total = Object.values(uploadCounts).reduce((sum, count) => sum + count, 0);
    setTotalPdfCount(total);
  }, [uploadCounts]);

  const fetchRecentUploads = async () => {
    const allFiles: any[] = [];
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
      'Bank Statements': 0,
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
      second: includeSeconds ? '2-digit' : undefined,
    }) + ", Emily Parker";
  };

  const handleUpload = async (files: FileList, type: string) => {
    const newUploadedFiles: any[] = [];
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
          uploadedAt: serverTimestamp(),
        });

        const newFile = {
          id: docRef.id,
          name: file.name,
          url: downloadURL,
          type: type,
          aiStatus: 'Not Analysed',
          uploadedAt: now,
          uploaded: formatDate(now, true),
        };

        newUploadedFiles.push(newFile);
        
        // Update progress
        setUploadCounts(prev => ({
          ...prev,
          [type]: prev[type] + 1,
        }));
        setLastUploadDate(formatDate(now, true));
      } catch (error) {
        console.error("Error uploading file: ", error);
      }
    }

    setUploadedFiles(prevFiles => [...newUploadedFiles, ...prevFiles]);

    if (onUploadComplete) {
      onUploadComplete(newUploadedFiles);
    }

    await fetchRecentUploads();
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

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedForDelete(new Set());
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedForDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCancelDelete = () => {
    setSelectedForDelete(new Set());
    setIsDeleteMode(false);
  };

  const handleDelete = async () => {
    const deletedFiles: any[] = [];
    let locationError = false;

    for (const id of selectedForDelete) {
      const file = uploadedFiles.find(f => f.id === id);
      if (file) {
        const collectionName = getCollectionName(file.type);
        try {
          // Delete from Firestore
          await deleteDoc(doc(db, collectionName, id));
          
          // Delete from Storage
          const storageRef = ref(storage, `${collectionName}/${file.name}`);
          await deleteObject(storageRef);

          deletedFiles.push(file);

          // Update counts
          setUploadCounts(prev => ({
            ...prev,
            [file.type]: prev[file.type] - 1,
          }));
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }
    }

    // Log deletion
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      for (const file of deletedFiles) {
        await addDoc(collection(db, 'EventLog'), {
          action: 'delete',
          fileName: file.name,
          fileType: file.type,
          deletedBy: 'Emily Parker',
          deletedAt: serverTimestamp(),
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
      locationError = true;

      // Log without location
      for (const file of deletedFiles) {
        await addDoc(collection(db, 'EventLog'), {
          action: 'delete',
          fileName: file.name,
          fileType: file.type,
          deletedBy: 'Emily Parker',
          deletedAt: serverTimestamp(),
          location: null,
        });
      }
    }

    // Refresh the file list
    fetchRecentUploads();
    setSelectedForDelete(new Set());
    setIsDeleteMode(false);

    // Show toast messages
    if (deletedFiles.length > 0) {
      toast({
        title: deletedFiles.length === 1 ? "File Deleted" : "Files Deleted",
        description: deletedFiles.length === 1
          ? "The selected file was successfully deleted!"
          : "The selected files were successfully deleted!",
      });
    }

    if (locationError) {
      toast({
        title: "Location Error",
        description: "Unable to record location data for this action.",
        variant: "destructive",
      });
    }
  };

  const getAIStatusBadge = (status: string, isSelected: boolean) => {
    return (
      <Badge 
        variant={status === "Analysed" ? "secondary" : "outline"}
        className={cn(
          isSelected && status !== "Analysed" && "border-red-500 text-red-500"
        )}
      >
        {status}
      </Badge>
    );
  };

  const filterFiles = (files: any[], tab: string) => {
    if (tab === 'all') return files;
    return files.filter(file => file.type.toLowerCase().includes(tab.toLowerCase()));
  };

  const getTableTitle = () => {
    if (activeTab === 'all') {
      return `All Uploaded PDF receipts (${totalPdfCount})`;
    } else {
      const filteredFiles = filterFiles(uploadedFiles, activeTab);
      const typeName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      return `Uploaded ${typeName} (${filteredFiles.length})`;
    }
  };

  const getLastUploadForType = (type: string) => {
    const filteredFiles = filterFiles(uploadedFiles, type);
    if (filteredFiles.length > 0) {
      return formatDate(filteredFiles[0].uploadedAt, true);
    }
    return 'No uploads for this type';
  };

  const handleRowClick = (file: any) => {
    if (!isDeleteMode) {
      setSelectedPdf(file.url);
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
            <Button variant="outline" size="sm" onClick={toggleDeleteMode}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </Tabs>

      <div className="bg-white p-6 rounded-lg shadow mt-4">
        <h3 className="text-lg font-semibold mb-2">{getTableTitle()}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Last upload: {activeTab === 'all' ? lastUploadDate : getLastUploadForType(activeTab)}
        </p>

        {isDeleteMode && (
          <div className="border border-red-500 rounded p-4 mb-4 flex justify-between items-center">
            {selectedForDelete.size === 0 ? (
              <p className="text-red-500 font-semibold">Please select the uploaded pdf files to delete!</p>
            ) : (
              <>
                <p className="text-red-500 font-semibold">
                  Are you sure to delete {selectedForDelete.size} selected {selectedForDelete.size === 1 ? 'file' : 'files'}?
                </p>
                <div>
                  <Button variant="outline" className="mr-2" onClick={handleCancelDelete}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
              </>
            )}
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              {isDeleteMode && (
                <TableHead className="text-red-500 w-[100px] text-center">Delete PDF</TableHead>
              )}
              <TableHead>Filename</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>AI Status</TableHead>
              <TableHead>Upload Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterFiles(uploadedFiles, activeTab).map((file) => {
              const isSelected = selectedForDelete.has(file.id);
              return (
                <TableRow 
                  key={file.id} 
                  className={cn(
                    "cursor-pointer hover:bg-blue-50 transition-colors",
                    isSelected && "text-red-500"
                  )}
                  onClick={() => handleRowClick(file)}
                >
                  {isDeleteMode && (
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleCheckboxChange(file.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          isSelected && "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-primary-foreground"
                        )}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="hover:underline">{file.name}</span>
                  </TableCell>
                  <TableCell>{file.type}</TableCell>
                  <TableCell>{getAIStatusBadge(file.aiStatus, isSelected)}</TableCell>
                  <TableCell>{formatDate(file.uploadedAt, true)}</TableCell>
                </TableRow>
              );
            })}
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