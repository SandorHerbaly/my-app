import React from 'react';
import { B10a1PdfListSection } from './B10a1-PdfList-section';
import B10a2PdfPreviewSection from './B10a2-PdfPreview-section';
import { Card, CardContent } from '@/components/ui/card';
import B10a3InvoiceImageDisplay from './B10a3InvoiceImageDisplay'; 

interface File {
  name: string;
  url: string;
  jsonData?: any;
  pngUrls?: string[]; // Tegyük opcionálissá
}

interface B10aPdfListWithPreviewProps {
  files: File[];
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClonePreview: (data: any) => void;
}

const B10aPdfListWithPreview: React.FC<B10aPdfListWithPreviewProps> = ({ 
  files, 
  onFileSelect, 
  selectedFile, 
  onClonePreview 
}) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
      <Card className="md:col-span-3 lg:col-span-2">
        <CardContent className="p-4">
          <B10a1PdfListSection files={files} onPdfClick={onFileSelect} selectedPdf={selectedFile} />
        </CardContent>
      </Card>
      
      <div className="md:col-span-9 lg:col-span-10 grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <B10a2PdfPreviewSection selectedPdf={selectedFile} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1 min-h-[600px]"> 
          <CardContent className="p-4">
            <B10a3InvoiceImageDisplay 
              onClonePreview={onClonePreview} 
              selectedFile={selectedFile} 
            /> 
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default B10aPdfListWithPreview;