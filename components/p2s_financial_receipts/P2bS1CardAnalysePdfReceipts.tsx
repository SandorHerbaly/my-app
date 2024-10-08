import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Download, Trash2 } from 'lucide-react';
import { storage, db } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, Timestamp, deleteDoc, doc, where, updateDoc, getDoc } from 'firebase/firestore';
import P2S3PdfViewerDialog from './P2S3PdfViewerDialog';
import P2bS3JsonViewerDialog from './P2bS3JsonViewerDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import { BsFiletypePdf, BsFiletypeJson } from "react-icons/bs";

interface AnalyseCardProps {
  title: string;
  count: number;
  analysedCount: number;
  lastAnalysis: string;
  onUpload: (files: FileList, updateProgress: (current: number, total: number) => void) => Promise<void>;
}

const AnalyseCard: React.FC<AnalyseCardProps> = ({ title, count, analysedCount, lastAnalysis, onUpload }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsUploading(true);
      setTotalFiles(event.target.files.length);
      setCurrentFileIndex(0);
      setUploadProgress(0);
      try {
        await onUpload(event.target.files, updateProgress);
      } catch (error) {
        console.error("Error during upload:", error);
        toast({
          title: "Upload Error",
          description: "An error occurred during the upload process.",
          variant: "destructive",
        });
      }
      setIsUploading(false);
    }
  };

  const updateProgress = (current: number, total: number) => {
    setCurrentFileIndex(current);
    setUploadProgress((current / total) * 100);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-grow pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-medium">{title}</CardTitle>
          {count > 0 && (
            <img 
              src="/Gemini_logo.png" 
              alt="Gemini Logo" 
              className="gemini-logo-large"
            />
          )}
        </div>
        {count > 0 ? (
          <>
            <p className="text-sm font-semibold mb-1">Analysed by Gemini</p>
            <div className="flex items-center">
              <span className="text-3xl font-bold">{`${analysedCount}/${count}`}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last analysis: {lastAnalysis}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            There is no uploaded pdf
          </p>
        )}
      </CardHeader>
      <CardContent className="mt-auto">
        {isUploading && (
          <div className="mb-2">
            <p className="text-xs text-center mb-1">
              Uploading file {currentFileIndex} of {totalFiles}
            </p>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
        {count === 0 && (
          <Button
            onClick={() => document.getElementById(`fileInput-${title}`)?.click()}
            className="w-full"
            disabled={isUploading}
          >
            <FileUp className="mr-2 h-4 w-4" /> Upload {title.toLowerCase()}
          </Button>
        )}
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

interface P2bS1CardAnalysePdfReceiptsProps {
  onUploadComplete?: (newFiles: any[]) => void;
}

const P2bS1CardAnalysePdfReceipts: React.FC<P2bS1CardAnalysePdfReceiptsProps> = ({ onUploadComplete }) => {
  const [uploadCounts, setUploadCounts] = useState({
    Orders: 0,
    Invoices: 0,
    'WSK Invoices': 0,
    'Bank Statements': 0,
  });
  const [analysedCounts, setAnalysedCounts] = useState({
    Orders: 0,
    Invoices: 0,
    'WSK Invoices': 0,
    'Bank Statements': 0,
  });
  const [lastAnalysisDate, setLastAnalysisDate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [totalPdfCount, setTotalPdfCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [invalidFiles, setInvalidFiles] = useState<string[]>([]);
  const [duplicateFiles, setDuplicateFiles] = useState<string[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showInvalidFileAlert, setShowInvalidFileAlert] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([]);
  const [isAnalyseMode, setIsAnalyseMode] = useState(false);
  const [selectedForAnalyse, setSelectedForAnalyse] = useState<Set<string>>(new Set());
  const [selectedJson, setSelectedJson] = useState<{ content: string; aiFileName: string } | null>(null);

  

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  useEffect(() => {
    const total = Object.values(uploadCounts).reduce((sum, count) => sum + count, 0);
    setTotalPdfCount(total);
  }, [uploadCounts]);

  const fetchRecentUploads = async () => {
    const allFiles: any[] = [];
    const collections = ['UploadedPdfOrders', 'UploadedPdfInvoices', 'UploadedWskInvoices', 'UploadedBankStatements'];
    
    for (const collectionName of collections) {
      const q = query(collection(db, collectionName), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allFiles.push({
          id: doc.id,
          name: data.name,
          type: data.type,
          aiStatus: data.aiStatus,
          uploadedAt: data.uploadedAt.toDate(),
          aiFiles: data.aiFiles || '-',
          url: data.url
        });
      });
    }

    allFiles.sort((a, b) => b.uploadedAt - a.uploadedAt);
    setUploadedFiles(allFiles);

    if (allFiles.length > 0) {
      setLastAnalysisDate(formatDate(allFiles[0].uploadedAt, true));
    }

    const counts = {
      Orders: 0,
      Invoices: 0,
      'WSK Invoices': 0,
      'Bank Statements': 0,
    };
    const analysed = {
      Orders: 0,
      Invoices: 0,
      'WSK Invoices': 0,
      'Bank Statements': 0,
    };
    allFiles.forEach(file => {
      counts[file.type]++;
      if (file.aiStatus === 'Analysed') {
        analysed[file.type]++;
      }
    });
    setUploadCounts(counts);
    setAnalysedCounts(analysed);
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

  const validateFileName = (fileName: string, type: string): boolean => {
    if (!fileName.toLowerCase().endsWith('.pdf')) return false;

    switch (type) {
      case 'Orders':
        return /^(S\d{5}\.pdf|Order - S\d{5}\.pdf)$/i.test(fileName);
      case 'Invoices':
        return /^INV_\d{4}_\d{5}\.pdf$/i.test(fileName);
      case 'WSK Invoices':
        return true; // Any PDF is allowed for now
      case 'Bank Statements':
        return /^\d{8}_\d{6}[A-Z]{3}\d{4}\.PDF$/i.test(fileName);
      default:
        return false;
    }
  };

  const checkForDuplicates = async (files: File[], type: string): Promise<string[]> => {
    const duplicates: string[] = [];
    const collectionName = getCollectionName(type);
    for (const file of files) {
      const q = query(collection(db, collectionName), where("name", "==", file.name));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        duplicates.push(file.name);
      }
    }
    return duplicates;
  };

  const handleUpload = async (files: FileList, type: string, updateProgress: (current: number, total: number) => void) => {
    const validFiles: File[] = [];
    const invalidFileNames: string[] = [];
    let duplicateFileNames: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (validateFileName(files[i].name, type)) {
        validFiles.push(files[i]);
      } else {
        invalidFileNames.push(files[i].name);
      }
    }

    duplicateFileNames = await checkForDuplicates(validFiles, type);

    setInvalidFiles(invalidFileNames);
    setDuplicateFiles(duplicateFileNames);

    if (invalidFileNames.length > 0) {
      setShowInvalidFileAlert(true);
      return;
    }

    const filesToUpload = validFiles.filter(file => !duplicateFileNames.includes(file.name));

    const newUploadedFiles: any[] = [];
    const collectionName = getCollectionName(type);

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const storageRef = ref(storage, `${collectionName}/${file.name}`);
      
      try {
        const uploadingFile = {
          name: file.name,
          type: type,
          aiStatus: 'Uploading',
          uploadedAt: new Date(),
        };
        setUploadingFiles(prev => [uploadingFile, ...prev]);

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
        
        setUploadCounts(prev => ({
          ...prev,
          [type]: prev[type] + 1,
        }));
        setLastAnalysisDate(formatDate(now, true));

        setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
        setUploadedFiles(prev => [newFile, ...prev]);

        updateProgress(i + 1, filesToUpload.length);
      } catch (error) {
        console.error("Error uploading file: ", error);
        setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
      }
    }

    if (onUploadComplete) {
      onUploadComplete(newUploadedFiles);
    }

    if (duplicateFileNames.length > 0) {
      setShowDuplicateDialog(true);
    }
  };

  const handleDuplicateOverwrite = async () => {
    const filesToOverwrite = duplicateFiles;
    for (const fileName of filesToOverwrite) {
      const file = uploadedFiles.find(f => f.name === fileName);
      if (file) {
        await handleDelete([file.id]);
      }
    }
    setShowDuplicateDialog(false);
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
    if (isAnalyseMode) {
      setIsAnalyseMode(false);
      setSelectedForAnalyse(new Set());
    }
  };

  const toggleAnalyseMode = () => {
    setIsAnalyseMode(!isAnalyseMode);
    setSelectedForAnalyse(new Set());
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedForDelete(new Set());
    }
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

  const handleAnalyseCheckboxChange = (id: string) => {
    setSelectedForAnalyse(prev => {
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

  const handleCancelAnalyse = () => {
    setSelectedForAnalyse(new Set());
    setIsAnalyseMode(false);
  };

  const handleDelete = async (idsToDelete: string[]) => {
    const filesToDelete = idsToDelete.reverse();
    const deletedFiles: any[] = [];
    let locationError = false;
  
    for (const id of filesToDelete) {
      setDeletingFiles(prev => new Set(prev).add(id));
      const file = uploadedFiles.find(f => f.id === id);
      if (file) {
        const collectionName = getCollectionName(file.type);
        try {
          // Töröljük a PDF fájlt a Firestore-ból és a Storage-ból
          await deleteDoc(doc(db, collectionName, id));
          
          const storageRef = ref(storage, `${collectionName}/${file.name}`);
          await deleteObject(storageRef);
  
          console.log(`PDF törölve: ${collectionName}/${file.name}`);
  
          let jsonDeleted = false;
          let jsonFileName = '';
  
          // Ellenőrizzük, hogy van-e hozzá tartozó JSON fájl
          if (file.aiStatus === 'Analysed') {
            const possibleJsonFileNames = [
              `AI_${file.name.replace('.pdf', '.json')}`,
              `AI_${file.name}`.replace('.pdf', '.json'),
              file.name.replace('.pdf', '.json')
            ];
  
            for (const jsonName of possibleJsonFileNames) {
              const jsonRef = ref(storage, `AI-Invoices/${jsonName}`);
              try {
                // Először ellenőrizzük, hogy létezik-e a fájl
                await getMetadata(jsonRef);
                console.log(`JSON fájl megtalálva: AI-Invoices/${jsonName}`);
                
                // Ha ide eljutunk, a fájl létezik, megpróbáljuk törölni
                await deleteObject(jsonRef);
                console.log(`JSON törölve: AI-Invoices/${jsonName}`);
                jsonDeleted = true;
                jsonFileName = jsonName;
                break;
              } catch (error) {
                if (error.code === 'storage/object-not-found') {
                  console.log(`JSON fájl nem található: AI-Invoices/${jsonName}`);
                } else {
                  console.error(`Hiba a JSON fájl törlése közben: AI-Invoices/${jsonName}`, error);
                }
              }
            }
  
            if (!jsonDeleted) {
              console.log(`Nem sikerült JSON fájlt találni a következő PDF-hez: ${file.name}`);
              // Ellenőrizzük a fájl metaadatait
              try {
                const metadata = await getMetadata(ref(storage, `AI-Invoices/AI_${file.name.replace('.pdf', '.json')}`));
                console.log('JSON fájl metaadatai:', metadata);
              } catch (metaError) {
                console.log('Nem sikerült lekérni a JSON fájl metaadatait:', metaError);
              }
            }
          }
  
          deletedFiles.push({...file, jsonDeleted, jsonFileName});
  
          setUploadCounts(prev => ({
            ...prev,
            [file.type]: prev[file.type] - 1,
          }));
  
          setUploadedFiles(prev => prev.filter(f => f.id !== id));
  
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  
    // ... (a függvény többi része változatlan marad)
  };

  const [isAnalysing, setIsAnalysing] = useState(false);

  const sendPdfToAnalyseEndpoint = async (file: any, endpoint: string) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdf_filename: file.name,
          type: file.type,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error details:', errorData);
        throw new Error(`Processing failed with status: ${response.status}. Details: ${JSON.stringify(errorData)}`);
      }
  
      return response;
    } catch (error) {
      console.error('Error sending PDF to analyse endpoint:', error);
      throw error;
    }
  };



  const handleAnalyse = async (idsToAnalyse: string[]) => {
    setIsAnalysing(true);
    
    for (const id of idsToAnalyse) {
      const file = uploadedFiles.find(f => f.id === id);
      if (file) {
        try {
          const endpoint = getApiEndpoint(file.type);  // Itt kaphatod meg a megfelelő API végpontot a fájl típusától függően
          console.log(`${file.type} típusú ${file.name} elemzésének megkezdése.`);
          
          const response = await sendPdfToAnalyseEndpoint(file, endpoint);
          
          if (!response.ok) {
            console.error(`Error analysing file: ${file.name}`);
            toast({
              title: "Analysis Error",
              description: `Failed to analyse ${file.name}. Please try again.`,
              variant: "destructive",
            });
          } else {
            console.log(`${file.type} típusú ${file.name} elemzése sikeresen befejeződött.`);
            toast({
              title: "Analysis Complete",
              description: `${file.name} successfully analysed.`,
            });

            // copy start - Frissítsd az uploadedFiles állapotot és az adatbázist
            setUploadedFiles(prevFiles => prevFiles.map(f => 
              f.id === file.id ? 
              { ...f, aiStatus: 'Analysed', aiFiles: 'json,pdf' } : 
              f
          ));

          // Firestore frissítés
          const docRef = doc(db, getCollectionName(file.type), file.id);
          await updateDoc(docRef, {
              aiStatus: 'Analysed',
              aiFiles: 'json,pdf'
          });
          // copy end - állapot és adatbázis frissítése vége

          }
        } catch (error) {
          console.error("Error analysing file:", error);
          toast({
            title: "Analysis Error",
            description: `Failed to analyse ${file.name}. Please try again.`,
            variant: "destructive",
          });
        }
      }
    }
  
    setSelectedForAnalyse(new Set());
    setIsAnalyseMode(false);
    setIsAnalysing(false);
    toast({
      title: "Analysis Complete",
      description: "Selected files have been analysed successfully.",
    });
    
    await fetchRecentUploads();
  };
  
  const getApiEndpoint = (type: string): string => {
    switch (type) {
      case 'Orders':
        return '/api/01_processing_pdf_order';
      case 'Invoices':
        return '/api/02_processing_pdf_invoice';
      case 'WSK Invoices':
        return '/api/03_processing_pdf_wsk_invoice';
      case 'Bank Statements':
        return '/api/04_processing_pdf_bank_statement';
      default:
        throw new Error('Unknown file type');
    }
  };
  






  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  };

  const handleRowClick = (file: any) => {
    if (!isAnalyseMode && !isDeleteMode && file.aiStatus !== 'Uploading') {
      setSelectedPdf(file.url);
    }
  };

  const handleJsonClick = async (file: any) => {
    console.log('JSON ikon kattintás:', file);
    if (file.aiStatus === 'Analysed') {
        console.log('File elemzett állapotban van');
        try {
            let content;
            if (file.aiResult) {
                console.log('aiResult megtalálható:', file.aiResult);
                content = typeof file.aiResult === 'string' ? JSON.parse(file.aiResult) : file.aiResult;
            } else {
                console.log('aiResult hiányzik, megpróbáljuk lekérni a Firestore-ból');
                const collectionName = 'AI-Invoices';  // Használjuk ezt a gyűjteményt
                const docRef = doc(db, collectionName, `AI_${file.name.replace('.pdf', '.json')}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    content = docSnap.data();
                    console.log('Firestore-ból lekért tartalom:', content);
                    
                    // Frissítsük a lokális state-et is
                    setUploadedFiles(prev => prev.map(f => 
                        f.id === file.id ? { ...f, aiResult: content } : f
                    ));
                } else {
                    console.log('Dokumentum nem található:', docRef.path);
                    throw new Error('Nem található aiResult a dokumentumhoz');
                }
            }

            if (!content) {
                console.log('Üres tartalom:', content);
                throw new Error('Üres aiResult');
            }

            console.log('Végső tartalom:', content);
            
            setSelectedJson({
                content: JSON.stringify(content, null, 2),
                aiFileName: `AI_${file.name.replace('.pdf', '.json')}`
            });
        } catch (error) {
            console.error('Hiba a JSON adatok kezelése során:', error);
            toast({
                title: "JSON Error",
                description: `Hiba történt a JSON adatok betöltése során: ${error.message}`,
                variant: "destructive",
            });
        }
    } else {
        console.log('File nincs elemezve:', file.aiStatus);
        toast({
            title: "Not Analysed",
            description: "Ez a fájl még nincs elemezve.",
            variant: "warning",
        });
    }
};



  const getTableTitle = () => {
    if (activeTab === 'all') {
      return `All Financial receipts (${totalPdfCount})`;
    } else {
      const filteredFiles = filterFiles(uploadedFiles, activeTab);
      const typeName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      return `${typeName} (${filteredFiles.length})`;
    }
  };

  const getLastAnalysisForType = (type: string) => {
    const filteredFiles = filterFiles(uploadedFiles, type);
    if (filteredFiles.length > 0) {
      return formatDate(filteredFiles[0].uploadedAt, true);
    }
    return 'No analysis for this type';
  };

  const filterFiles = (files: any[], tab: string) => {
    if (tab === 'all') return files;
    return files.filter(file => file.type.toLowerCase().includes(tab.toLowerCase()));
  };

  const getAIStatusBadge = (status: string, isSelected: boolean, isSelectedForDelete: boolean, isSelectedForAnalyse: boolean) => {
    const isAnalysed = status === "Analysed";
  
    const badgeColorClass = isAnalysed
      ? isSelectedForDelete 
        ? "bg-[#F9E3E3] text-red-500" // Piros háttér és szöveg, ha törlésre ki van választva
        : isSelectedForAnalyse
          ? "bg-[#DAE5FB] text-blue-500" // Halványkék háttér és kék szöveg, ha analizálásra ki van választva
          : "bg-[#EDF1F8] text-black" // Halványszürke háttér és fekete szöveg, ha nincs kijelölve
      : isSelectedForDelete
        ? "border-red-500 text-red-500" // Piros keret és szöveg, ha törlésre ki van választva
        : isSelectedForAnalyse
          ? "border-blue-500 text-blue-500" // Kék keret és szöveg, ha analizálásra ki van választva
          : "border-gray-300 text-black"; // Halványszürke keret és fekete szöveg, ha nincs kijelölve
  
    return (
      <Badge 
        variant={isAnalysed ? "secondary" : "outline"}
        className={cn(badgeColorClass, "px-2 py-1 rounded")}
      >
        {isAnalysed && (
          <img 
            src={
              isSelectedForDelete 
                ? "/Gemini_logo_red.png" 
                : isSelectedForAnalyse 
                  ? "/Gemini_logo_blue.png" 
                  : "/Gemini_logo.png"
            } // Piros logó, ha törlésre ki van választva, kék logó, ha analizálásra ki van választva, egyébként fekete logó
            alt="Gemini Logo" 
            className="gemini-logo-small mr-1"
          />
        )}
        {status}
      </Badge>
    );
  };
  

  const handleFilenameClick = (file: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Ezzel megelőzöd, hogy a sorra kattintás eseménye is lefusson
    setSelectedPdf(file.url); // Mindig megnyitja a PDF-et, függetlenül az elemzési státusztól
  };
  
  

  return (
    <>
      <h2 className="text-3xl font-bold mb-6">Analyse Financial Receipts</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {Object.entries(uploadCounts).map(([title, count]) => (
          <AnalyseCard
            key={title}
            title={title}
            count={count}
            analysedCount={analysedCounts[title]}
            lastAnalysis={lastAnalysisDate}
            onUpload={(files, updateProgress) => handleUpload(files, title, updateProgress)}
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
            <Button variant="outline" size="sm" onClick={toggleAnalyseMode}>
              <img 
                src="/Gemini_logo.png" 
                alt="Gemini Logo" 
                className="gemini-logo-small mr-1"
              />
              Analyse
            </Button>
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
          Last analysis: {activeTab === 'all' ? lastAnalysisDate : getLastAnalysisForType(activeTab)}
        </p>

        {isAnalyseMode && (
          <div className="border border-blue-500 rounded p-4 mb-4 flex justify-between items-center">
            {selectedForAnalyse.size === 0 ? (
              <p className="text-blue-500 font-semibold">Please select pdf files to be analysed by Gemini!</p>
            ) : (
              <>
                <p className="text-blue-500 font-semibold">
                  Analyse {selectedForAnalyse.size} selected {selectedForAnalyse.size === 1 ? 'file' : 'files'}?
                </p>
                <div>
                  <Button variant="outline" className="mr-2" onClick={handleCancelAnalyse}>Cancel</Button>
                  <Button variant="default" onClick={() => handleAnalyse(Array.from(selectedForAnalyse))}>Analyse PDF</Button>
                </div>
              </>
            )}
          </div>
        )}

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
                  <Button variant="destructive" onClick={() => handleDelete(Array.from(selectedForDelete))}>Delete</Button>
                </div>
              </>
            )}
          </div>
        )}
      <Table>
        <TableHeader>
          <TableRow>
            {(isDeleteMode || isAnalyseMode) && (
              <TableHead className={cn(
                "w-[100px] text-center",
                isDeleteMode ? "text-red-500" : "text-blue-500"
              )}>
                {isDeleteMode ? "Delete PDF" : "Analyse PDF"}
              </TableHead>
            )}
            <TableHead>Filename</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>AI Status</TableHead>
            <TableHead>AI Files</TableHead>
            <TableHead>Date of Analysis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...uploadingFiles, ...filterFiles(uploadedFiles, activeTab)].map((file) => {
            const isSelectedForDelete = selectedForDelete.has(file.id);
            const isSelectedForAnalyse = selectedForAnalyse.has(file.id);
            const isBeingDeleted = deletingFiles.has(file.id);
            const isUploading = file.aiStatus === 'Uploading';
            return (
              <TableRow 
                key={file.id || file.name}
                className={cn(
                  "hover:bg-blue-50 transition-colors", // Eltávolítva a cursor-pointer a teljes sorra
                  isSelectedForDelete && "text-red-500",
                  isSelectedForAnalyse && "text-blue-500",
                  isBeingDeleted && "opacity-50 line-through",
                  isUploading && "bg-blue-50"
                )}
              >
                {(isDeleteMode || isAnalyseMode) && (
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isDeleteMode ? isSelectedForDelete : isSelectedForAnalyse}
                      onCheckedChange={() => isDeleteMode ? handleCheckboxChange(file.id) : handleAnalyseCheckboxChange(file.id)}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        isDeleteMode && isSelectedForDelete && "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-primary-foreground",
                        isAnalyseMode && isSelectedForAnalyse && "border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-primary-foreground"
                      )}
                      disabled={isUploading}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <span 
                    className="hover:underline cursor-pointer" // cursor-pointer csak itt
                    onClick={(event) => handleFilenameClick(file, event)} 
                  >
                    {file.name}
                  </span>
                </TableCell>
                <TableCell>{file.type}</TableCell>
                <TableCell>{getAIStatusBadge(file.aiStatus, isSelectedForAnalyse, isSelectedForDelete, isSelectedForAnalyse)}</TableCell>
                <TableCell className="text-center">
                  {file.aiFiles === 'json,pdf' ? (
                    <div className="flex items-center justify-center space-x-4">
                      <div 
                        className={cn(
                          "p-1 rounded-sm hover:bg-[#AFC4DF] cursor-pointer transition-colors",
                          isSelectedForDelete && "text-red-500",
                          isSelectedForAnalyse && "text-blue-500"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPdf(file.url);
                        }}
                      >
                        <BsFiletypePdf className={cn("w-5 h-5", isSelectedForDelete && "text-red-500", isSelectedForAnalyse && "text-blue-500")} />
                      </div>
                      <div className="h-4 w-px bg-gray-300"></div>
                      <div 
                        className={cn(
                          "p-1 rounded-sm hover:bg-[#AFC4DF] cursor-pointer transition-colors",
                          isSelectedForDelete && "text-red-500",
                          isSelectedForAnalyse && "text-blue-500"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJsonClick(file);
                        }}
                      >
                        <BsFiletypeJson className={cn("w-5 h-5", isSelectedForDelete && "text-red-500", isSelectedForAnalyse && "text-blue-500")} />
                      </div>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{isUploading ? 'Uploading...' : formatDate(file.analysedAt || file.uploadedAt, true)}</TableCell>
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

      {selectedJson && (
        <P2bS3JsonViewerDialog 
          isOpen={!!selectedJson} 
          onClose={() => setSelectedJson(null)} 
          jsonContent={selectedJson.content} 
          aiFileName={selectedJson.aiFileName}
        />
      )}

      <Dialog open={showInvalidFileAlert} onOpenChange={setShowInvalidFileAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invalid Files Detected</DialogTitle>
            <DialogDescription>
              The following files could not be uploaded due to invalid format:
              {invalidFiles.map(file => (
                <div key={file}>{file}</div>
              ))}
              Please check the file names and try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowInvalidFileAlert(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Files Detected</DialogTitle>
            <DialogDescription>
              The following files already exist in the database:
              {duplicateFiles.map(file => (
                <div key={file}>{file}</div>
              ))}
              Do you want to overwrite these files?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>Cancel</Button>
            <Button onClick={handleDuplicateOverwrite}>Overwrite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAnalysing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analysing Documents</DialogTitle>
            <DialogDescription>
              The analysis process may take a few minutes. Please be patient...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Progress value={100} className="w-[60%]" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default P2bS1CardAnalysePdfReceipts;