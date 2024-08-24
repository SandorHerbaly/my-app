import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface B10a3InvoiceImageDisplayProps {
  selectedFile: { name: string, pngUrls: string[] } | null;
}

const B10a3InvoiceImageDisplay: React.FC<B10a3InvoiceImageDisplayProps> = ({ selectedFile }) => {
  const router = useRouter();

  const handleAssignData = () => {
    if (selectedFile) {
      router.push(`/dashboard/invoices/p13-assign-invoice-data?fileName=${selectedFile.name}`);
    } else {
      console.error("Nincs kiválasztott fájl");
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md"> 
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Számla Kép</h3>
        <Button onClick={handleAssignData} disabled={!selectedFile}>Adatok kijelölése</Button>
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
          <p>Nincs elérhető számla kép. Kérjük, töltsön fel és dolgozzon fel egy PDF számlát.</p>
        )}
      </div>
    </div>
  );
};

export default B10a3InvoiceImageDisplay;
