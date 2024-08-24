import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfPreviewSectionProps {
  selectedPdf: { url: string } | null;
}

const B10a2PdfPreviewSection: React.FC<PdfPreviewSectionProps> = ({ selectedPdf }) => {
  const [key, setKey] = useState(0);
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [],
    toolbarPlugin: {
      fullScreenPlugin: {
        onEnterFullScreen: (zoom) => {
          zoom(SpecialZoomLevel.PageFit);
        },
        onExitFullScreen: (zoom) => {
          zoom(SpecialZoomLevel.PageFit);
        },
      },
    },
  });

  useEffect(() => {
    // Frissítjük a key-t, amikor új PDF-et választanak ki
    setKey(prevKey => prevKey + 1);
  }, [selectedPdf]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">PDF Előnézet</h3>
      {selectedPdf ? (
        <div className="w-full" style={{ height: '500px' }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
            <div style={{ height: '100%', width: '100%' }}>
              <Viewer 
                key={key}
                fileUrl={selectedPdf.url}
                plugins={[defaultLayoutPluginInstance]}
                defaultScale={SpecialZoomLevel.PageFit}
                renderLoader={(percentages: number) => (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Betöltés... {Math.round(percentages)}%
                  </div>
                )}
              />
            </div>
          </Worker>
        </div>
      ) : (
        <div className="h-[500px] w-full flex items-center justify-center text-muted-foreground">
          Nincs kiválasztott PDF
        </div>
      )}
    </div>
  );
};

export default B10a2PdfPreviewSection;
