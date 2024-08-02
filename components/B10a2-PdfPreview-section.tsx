import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfPreviewSectionProps {
  selectedPdf: { url: string } | null;
}

const B10a2PdfPreviewSection: React.FC<PdfPreviewSectionProps> = ({ selectedPdf }) => {
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

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">PDF Preview</h3>
      {selectedPdf ? (
        <div className="w-full" style={{ height: 'auto' }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
            <div style={{ height: 'auto', width: '100%' }}>
              <Viewer 
                fileUrl={selectedPdf.url}
                plugins={[defaultLayoutPluginInstance]}
                defaultScale={SpecialZoomLevel.PageFit}
                renderLoader={(percentages: number) => (
                  <div style={{ width: '100%', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Loading... {Math.round(percentages)}%
                  </div>
                )}
                style={{ height: 'auto' }}
              />
            </div>
          </Worker>
        </div>
      ) : (
        <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground">
          No PDF selected
        </div>
      )}
    </div>
  );
};

export default B10a2PdfPreviewSection;