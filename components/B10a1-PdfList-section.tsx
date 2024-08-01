import React from 'react';

export function B10a1PdfListSection({ files, onPdfClick, selectedPdf }) {
  return (
    <div className="w-1/4 p-4 overflow-auto border-r">
      <h3 className="text-lg font-medium">Uploaded PDF Invoices</h3>
      <ul>
        {files.map((file, index) => (
          <li key={index} className="my-2">
            <button
              className={`block w-full text-left px-4 py-2 rounded ${
                selectedPdf && selectedPdf.name === file.name ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              onClick={() => onPdfClick(file)}
            >
              {file.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
