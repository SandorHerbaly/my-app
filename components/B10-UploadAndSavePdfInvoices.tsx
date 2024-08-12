import React, { useState, useRef, useCallback } from 'react';
import { storage, db } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload } from 'lucide-react';
import B10aPdfListWithPreview from './B10a-PdfListWithPreview';
import { convertPdfToPng } from '@/lib/invoiceProcessing/pdfToPng';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UploadedFile {
  id?: string;
  name: string;
  url: string;
  jsonData?: any;
  pngUrls: string[];
}

const B10UploadAndSavePdfInvoices: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [duplicateFile, setDuplicateFile] = useState<File | null>(null);
  const [selectedOption, setSelectedOption] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
          setSelectedFile(uploadedFile);
          toast.success(`A ${file.name} fájl sikeresen feltöltve és mentve.`);
          console.log("Feltöltött fájl adatai:", uploadedFile);
        } catch (error) {
          console.error("Hiba a fájl feltöltése és mentése során:", error);
          toast.error(`Nem sikerült feltölteni és menteni a ${file.name} fájlt.`);
        }
      }
    }
  }, [uploadedFiles]);

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    // ... (a fájl feltöltési logika változatlan marad)
  };

  const storeInvoiceData = async (invoiceData: UploadedFile): Promise<string> => {
    // ... (az adattárolási logika változatlan marad)
  };

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setSelectedFile(file);
  }, []);

  const handleClonePreview = useCallback(() => {
    if (selectedFile && selectedFile.name) {
      console.log('Navigálás az adatkijelölő oldalra:', selectedFile.name);
      router.push(`/dashboard/invoices/p13-assign-invoice-data?fileName=${selectedFile.name}`);
    } else {
      console.error('Nincs kiválasztott fájl vagy hiányzik a fájl neve');
      toast.error('Nem sikerült megnyitni az adatkijelölő oldalt. Kérjük, próbálja újra.');
    }
  }, [selectedFile, router]);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (value === "p14-analyze") {
      router.push('/dashboard/invoices/p14-analising-invoice-images');
    } else if (value === "p15-clone") {
      router.push('/dashboard/invoices/p15-cloning-invoices');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Számlák</h2>
        <Select value={selectedOption} onValueChange={handleOptionChange}>
          <SelectTrigger className="w-[400px]">
            <SelectValue placeholder="Válassz műveletet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upload" className="font-bold">Számlák feltöltése és mentése ({uploadedFiles.length})</SelectItem>
            <SelectItem value="p14-analyze" className="font-bold">p14-Számlaképek elemzése és JSON fájl generálása, mentése</SelectItem>
            <SelectItem value="p15-clone" className="font-bold">p15-Számlák klónozása generálta adatokból</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {selectedOption === "upload" && (
        <>
          <div className="flex justify-end">
            <Button onClick={triggerFileInput} className="flex items-center gap-2">
              <Upload size={16} />
              Számlák feltöltése és mentése
            </Button>
          </div>
          <B10aPdfListWithPreview 
            files={uploadedFiles} 
            onFileSelect={handleFileSelect} 
            selectedFile={selectedFile}
            onClonePreview={handleClonePreview}
          />
        </>
      )}
      
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
            <AlertDialogAction onClick={() => {
              if (duplicateFile) {
                handleFileUpload({ target: { files: [duplicateFile] } } as React.ChangeEvent<HTMLInputElement>);
              }
              setShowDialog(false);
            }}>Csere</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <input 
        type="file"
        ref={fileInputRef}
        multiple
        accept=".pdf"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default B10UploadAndSavePdfInvoices;