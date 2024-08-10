import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface B10a3InvoiceImageDisplayProps {
  onClonePreview: () => void;
  selectedFile: { pngUrls?: string[] } | null; 
}

const B10a3InvoiceImageDisplay: React.FC<B10a3InvoiceImageDisplayProps> = ({ onClonePreview, selectedFile }) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-md shadow-md"> 
      <div className="p-4 flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Számlakép</h3>
        <Button onClick={() => onClonePreview()} disabled={!selectedFile?.pngUrls || selectedFile.pngUrls.length === 0}>
          Adatok kijelölése 
        </Button>
      </div>
      <div className="p-4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {selectedFile?.pngUrls && selectedFile.pngUrls.length > 0 ? (
          selectedFile.pngUrls.map((url, index) => (
            <div key={index} className="mb-4">
              <p>Invoice-page{index + 1}/{selectedFile.pngUrls.length}.png</p>
              <img src={url} alt={`Invoice page ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
            </div>
          ))
        ) : (
          <p>No invoice images available. Please upload and process a PDF invoice.</p>
        )}
      </div>
    </div>
  );
};

export default B10a3InvoiceImageDisplay;