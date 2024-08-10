import React, { useState, useRef, useCallback } from 'react';
import { storage } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileIcon, Upload } from 'lucide-react';
import B10aPdfListWithPreview from './B10a-PdfListWithPreview';
import { extractTextFromPDF, convertTextToJson } from '@/lib/invoiceProcessing/pdfToJson';
import { convertPdfToPng } from '@/lib/invoiceProcessing/pdfToPng';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import B12AssignInvoiceData from './B12-AssignInvoiceData';
import { useRouter } from 'next/navigation'; // Importáld a useRouter-t

interface UploadedFile {
  name: string;
  url: string;
  jsonData?: any;
  pngUrls: string[];
}

interface B10UploadAndSavePdfInvoicesProps {
  //onClonePreview: (data: any) => void; // Töröljük a onClonePreview propertyt
}

const B10UploadAndSavePdfInvoices: React.FC<B10UploadAndSavePdfInvoicesProps> = ({} /*onClonePreview*/) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [duplicateFile, setDuplicateFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Hozd létre a routert

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      for (const file of newFiles) {
        if (file.type !== 'application/pdf') {
          toast.error(`${file.name} nem PDF fájl. Csak PDF fájlokat lehet feltölteni.`);
          continue;
        }
        
        const existingFile = uploadedFiles.find(f => f.name === file.name);
        if (existingFile) {
          setDuplicateFile(file);
          setShowDialog(true);
          continue;
        }
        
        try {
          const uploadedFile = await uploadFile(file);
          setUploadedFiles(prev => [...prev, uploadedFile]);
          if (!selectedFile) setSelectedFile(uploadedFile);
          toast.success(`A ${file.name} fájl sikeresen feltöltve.`);
        } catch (error) {
          console.error("Hiba a fájl feltöltése során:", error);
          toast.error(`Nem sikerült feltölteni a ${file.name} fájlt.`);
        }
      }
    }
  }, [uploadedFiles, selectedFile]);

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const storageRef = ref(storage, 'invoices/' + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    let jsonData;
    let pngUrls: string[] = [];
    try {
      pngUrls = await convertPdfToPng(file);
      const textContent = await extractTextFromPDF(file);
      jsonData = convertTextToJson(textContent);
      console.log(`Kinyert JSON adat a ${file.name} fájlhoz:`, jsonData);
    } catch (error) {
      console.error("Hiba a számla feldolgozása során:", error);
      jsonData = null;
      toast.error(`Nem sikerült feldolgozni a ${file.name} fájlt.`);
    }
    
    return { name: file.name, url, jsonData, pngUrls };
  };

  const handleReplaceFile = useCallback(async () => {
    if (duplicateFile) {
      try {
        const uploadedFile = await uploadFile(duplicateFile);
        setUploadedFiles(prev => prev.map(f => f.name === uploadedFile.name ? uploadedFile : f));
        toast.success(`A ${duplicateFile.name} fájl sikeresen lecserélve.`);
      } catch (error) {
        console.error("Hiba a fájl cseréje során:", error);
        toast.error(`Nem sikerült lecserélni a ${duplicateFile.name} fájlt.`);
      }
    }
    setShowDialog(false);
    setDuplicateFile(null);
  }, [duplicateFile]);

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setSelectedFile(file);
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

const handleClonePreview = useCallback(async () => {
  if (selectedFile) {
    router.push(`/dashboard/invoices/assign-invoice-data?data=${encodeURIComponent(JSON.stringify(selectedFile))}`);
  }
}, [selectedFile, router]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Számlák feltöltése és mentése ({uploadedFiles.length})</h2>
            <input 
              type="file"
              ref={fileInputRef}
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={triggerFileInput} className="flex items-center gap-2">
              <Upload size={16} />
              Számlák feltöltése és mentése
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6">
        <B10aPdfListWithPreview 
          files={uploadedFiles} 
          onFileSelect={handleFileSelect} 
          selectedFile={selectedFile}
          onClonePreview={handleClonePreview}

        />
      </div>
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>A fájl már létezik</AlertDialogTitle>
            <AlertDialogDescription>
              Egy "{duplicateFile?.name}" nevű fájl már létezik. Szeretné lecserélni?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDialog(false)}>Mégse</AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceFile}>Csere</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default B10UploadAndSavePdfInvoices;