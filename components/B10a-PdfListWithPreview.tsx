import React from 'react';
import { B10a1PdfListSection } from './B10a1-PdfList-section';
import B10a2PdfPreviewSection from './B10a2-PdfPreview-section';
import JsonDataDisplay from './JsonDataDisplay';

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
    <div className="flex mt-4">
      <div className="w-1/3 pr-4">
        <B10a1PdfListSection files={files} onPdfClick={onFileSelect} selectedPdf={selectedFile} />
        {selectedFile && selectedFile.jsonData && (
          <JsonDataDisplay jsonData={selectedFile.jsonData} />
        )}
      </div>
      <div className="w-2/3">
        <B10a2PdfPreviewSection selectedPdf={selectedFile} />
      </div>
    </div>
  );
};

export default B10aPdfListWithPreview;
