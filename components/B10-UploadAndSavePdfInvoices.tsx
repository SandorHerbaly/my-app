import React, { useState, useRef } from 'react';
import { storage, db } from '@/lib/firebase.config';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileIcon } from 'lucide-react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface UploadedFile {
  name: string;
  url: string;
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
      
      const newFile = { name: file.name, url };
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

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Upload and save pdf invoices ({uploadedFiles.length})</h2>
      <input 
        type="file"
        ref={fileInputRef}
        multiple
        accept=".pdf"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button 
        onClick={triggerFileInput}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Upload & save invoices
      </button>
      <div className="flex">
        <div className="w-1/4 pr-4">
          <h3 className="text-lg font-medium mb-2">Uploaded PDF Invoices</h3>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li 
                key={index} 
                className={`flex items-center mb-2 cursor-pointer ${selectedFile?.name === file.name ? 'font-bold' : ''}`}
                onClick={() => handleFileSelect(file)}
              >
                <FileIcon className="mr-2" />
                {file.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-3/4">
          {selectedFile && (
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js`}>
              <Viewer fileUrl={selectedFile.url} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
          )}
        </div>
      </div>
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
