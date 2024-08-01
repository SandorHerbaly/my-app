import React from 'react';
import { B10a1PdfListSection } from './B10a1-PdfList-section';
import B10a2PdfPreviewSection from './B10a2-PdfPreview-section';
import B10a3JsonDataDisplay from './B10a3-JsonDataDisplay';
import { Card, CardContent } from '@/components/ui/card';

interface File {
  name: string;
  url: string;
  jsonData?: any;
}

interface B10aPdfListWithPreviewProps {
  files: File[];
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const B10aPdfListWithPreview: React.FC<B10aPdfListWithPreviewProps> = ({ files, onFileSelect, selectedFile }) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
      <Card className="md:col-span-3 lg:col-span-2">
        <CardContent className="p-4">
          <B10a1PdfListSection files={files} onPdfClick={onFileSelect} selectedPdf={selectedFile} />
        </CardContent>
      </Card>
      
      <div className="md:col-span-9 lg:col-span-10 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <B10a2PdfPreviewSection selectedPdf={selectedFile} />
          </CardContent>
        </Card>
        
        {selectedFile && selectedFile.jsonData && (
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <B10a3JsonDataDisplay jsonData={selectedFile.jsonData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default B10aPdfListWithPreview;