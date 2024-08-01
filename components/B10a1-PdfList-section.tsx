import React from 'react';

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
    <div className="w-1/4 p-4 overflow-auto border-r">
      <h3 className="text-lg font-medium mb-4">Uploaded PDF Invoices</h3>
      {files.length > 0 ? (
        <ul>
          {files.map((file, index) => (
            <li key={index} className="mb-2">
              <button
                className={`w-full text-left px-4 py-2 rounded ${
                  selectedPdf?.name === file.name ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => onPdfClick(file)}
              >
                {file.name}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No PDF files uploaded yet.</p>
      )}
    </div>
  );
};