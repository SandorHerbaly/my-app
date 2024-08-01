import React, { useState, useRef } from 'react';
import { storage, db } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileIcon, Upload } from 'lucide-react';
import B10aPdfListWithPreview from './B10a-PdfListWithPreview';
import { extractTextFromPDF } from '@/lib/pdfToJsonConverter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UploadedFile {
  name: string;
  url: string;
  jsonData?: any;
}

const B10UploadAndSavePdfInvoices: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [duplicateFile, setDuplicateFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      for (const file of newFiles) {
        if (file.type !== 'application/pdf') {
          toast.error(`${file.name} is not a PDF file. Only PDF files are allowed.`);
          continue;
        }
        
        const existingFile = uploadedFiles.find(f => f.name === file.name);
        if (existingFile) {
          setDuplicateFile(file);
          setShowDialog(true);
          continue;
        }
        
        await uploadFile(file);
      }
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const storageRef = ref(storage, 'invoices/' + file.name);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      let jsonData;
      try {
        jsonData = await extractTextFromPDF(url);
      } catch (error) {
        console.error("Error extracting JSON data from PDF:", error);
        jsonData = null;
      }
      
      const newFile = { name: file.name, url, jsonData };
      setUploadedFiles(prev => [...prev, newFile]);
      if (!selectedFile) setSelectedFile(newFile);
      
      toast.success(`File ${file.name} uploaded successfully.`);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Failed to upload ${file.name}.`);
    }
  };

  const handleReplaceFile = async () => {
    if (duplicateFile) {
      const index = uploadedFiles.findIndex(f => f.name === duplicateFile.name);
      await uploadFile(duplicateFile);
      setUploadedFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { name: duplicateFile.name, url: prev[index].url };
        return newFiles;
      });
    }
    setShowDialog(false);
    setDuplicateFile(null);
  };

  const handleFileSelect = (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upload and save pdf invoices ({uploadedFiles.length})</h2>
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
              Upload & save invoices
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <B10aPdfListWithPreview files={uploadedFiles} onFileSelect={handleFileSelect} selectedFile={selectedFile} />
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>File already exists</AlertDialogTitle>
            <AlertDialogDescription>
              A file with the name "{duplicateFile?.name}" already exists. Do you want to replace it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceFile}>Replace</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default B10UploadAndSavePdfInvoices;