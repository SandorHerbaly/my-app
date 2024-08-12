'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface InvoiceData {
  [key: string]: any;
  pngUrls?: string[];
}

interface AssignedData {
  fieldId: string;
  value: string;
  coordinates: { x1: number; y1: number; x2: number; y2: number };
}

const B12AssignInvoiceData: React.FC = () => {
  const searchParams = useSearchParams();
  const dataString = searchParams.get('data');

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({});
  const [assignedData, setAssignedData] = useState<AssignedData[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (dataString) {
      try {
        const parsedData = JSON.parse(dataString);
        setInvoiceData(parsedData);
      } catch (error) {
        console.error('Hiba történt az adatok feldolgozása során:', error);
      }
    }
  }, [dataString]);

  useEffect(() => {
    if (invoiceData.pngUrls && invoiceData.pngUrls.length > 0) {
      loadImage(invoiceData.pngUrls[currentPage]);
    }
  }, [invoiceData, currentPage]);

  const loadImage = (url: string) => {
    const img = new Image();
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
        }
      }
    };
    img.src = url;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsSelecting(true);
    setSelectionStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSelecting) {
      setSelectionEnd({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    const newFieldId = `f-${(assignedData.length + 1).toString().padStart(2, '0')}`;
    const newAssignedData: AssignedData = {
      fieldId: newFieldId,
      value: 'Kijelölt adat',
      coordinates: {
        x1: Math.min(selectionStart.x, selectionEnd.x),
        y1: Math.min(selectionStart.y, selectionEnd.y),
        x2: Math.max(selectionStart.x, selectionEnd.x),
        y2: Math.max(selectionStart.y, selectionEnd.y),
      },
    };
    setAssignedData([...assignedData, newAssignedData]);
  };

  const handleDataDelete = (index: number) => {
    setAssignedData(assignedData.filter((_, i) => i !== index));
  };

  const changePage = (direction: 'next' | 'prev') => {
    if (invoiceData.pngUrls) {
      if (direction === 'next' && currentPage < invoiceData.pngUrls.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  return (
    <div className="flex mt-16">
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-semibold mb-4">Számlaadatok kijelölése</h2>
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ border: '1px solid black' }}
          />
          <div className="mt-2 flex justify-between">
            <button onClick={() => changePage('prev')} disabled={currentPage === 0}>Előző oldal</button>
            <span>Oldal: {currentPage + 1} / {invoiceData.pngUrls?.length || 1}</span>
            <button onClick={() => changePage('next')} disabled={!invoiceData.pngUrls || currentPage === invoiceData.pngUrls.length - 1}>Következő oldal</button>
          </div>
        </div>
      </div>
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-semibold mb-4">Mentésre kerülő adatok ({assignedData.length})</h2>
        <ul>
          {assignedData.map((item, index) => (
            <li key={index} className="flex justify-between items-center mb-2">
              <span>{item.value} ({item.fieldId})</span>
              <button onClick={() => handleDataDelete(index)} className="bg-red-500 text-white px-2 py-1 rounded">Törlés</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default B12AssignInvoiceData;