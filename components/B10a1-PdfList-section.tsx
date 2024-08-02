import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileIcon } from 'lucide-react';

interface File {
  name: string;
  url: string;
}

interface B10a1PdfListSectionProps {
  files: File[];
  onPdfClick: (file: File) => void;
  selectedPdf: File | null;
}

export const B10a1PdfListSection: React.FC<B10a1PdfListSectionProps> = ({ files, onPdfClick, selectedPdf }) => {
  return (
    <div className="h-[400px]">
      <h3 className="text-lg font-medium mb-4">PDF Invoices</h3>
      <ScrollArea className="h-[calc(100%-2rem)]">
        {files.length > 0 ? (
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index}>
                <Button
                  variant={selectedPdf?.name === file.name ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onPdfClick(file)}
                >
                  <FileIcon className="mr-2 h-4 w-4" />
                  {file.name}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No PDF files uploaded yet.</p>
        )}
      </ScrollArea>
    </div>
  );
};