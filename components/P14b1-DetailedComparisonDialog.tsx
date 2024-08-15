import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface DetailedComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  geminiData: string;
  pdfTextData: string;
  onSave: (updatedGeminiData: string) => void;
}

export const P14b1DetailedComparisonDialog: React.FC<DetailedComparisonDialogProps> = ({
  isOpen,
  onClose,
  fileName,
  geminiData,
  pdfTextData,
  onSave
}) => {
  const [editableGeminiData, setEditableGeminiData] = useState<any>({});
  const [differences, setDifferences] = useState<string[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsedData = JSON.parse(geminiData);
      setEditableGeminiData(parsedData);
      // Példa különbségek beállítása (ezt később valós összehasonlítással kell helyettesíteni)
      setDifferences(['szamla_szam.ODU_szamlaszam', 'osszegek.fizetendo_brutto_osszeg']);
    } catch (error) {
      console.error("Error parsing Gemini data:", error);
    }
  }, [geminiData]);

  const handleEdit = (key: string) => {
    setEditingField(key);
  };

  const handleSaveEdit = (key: string, value: string) => {
    const keys = key.split('.');
    let current = editableGeminiData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setEditableGeminiData({...editableGeminiData});
    setEditingField(null);
  };

  const renderGeminiData = (data: any, prefix = '') => {
    return Object.entries(data).map(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const isDifferent = differences.includes(fullKey);
      
      if (typeof value === 'object' && value !== null) {
        return (
          <div key={fullKey} className="ml-4">
            <span className="text-gray-700">{key}:</span>
            {renderGeminiData(value, fullKey)}
          </div>
        );
      }

      return (
        <div key={fullKey} className="ml-4">
          <span className="text-gray-700">{key}: </span>
          {editingField === fullKey ? (
            <Input
              value={value.toString()}
              onChange={(e) => handleSaveEdit(fullKey, e.target.value)}
              onBlur={() => setEditingField(null)}
              autoFocus
            />
          ) : (
            <span 
              className={`font-semibold ${isDifferent ? 'text-red-500 cursor-pointer' : ''}`}
              onClick={() => isDifferent && handleEdit(fullKey)}
            >
              {value.toString()}
            </span>
          )}
        </div>
      );
    });
  };

  const renderPdfText = () => {
    // Ez egy egyszerűsített példa. Valós esetben komplexebb feldolgozásra lehet szükség.
    return pdfTextData.split('\n').map((line, index) => {
      const [key, value] = line.split(':');
      const isDifferent = differences.some(diff => line.includes(diff.split('.').pop() || ''));
      return (
        <div key={index}>
          <span className="text-gray-700">{key}: </span>
          <span className={`font-semibold ${isDifferent ? 'text-green-500' : ''}`}>
            {value}
          </span>
        </div>
      );
    });
  };

  const handleSave = () => {
    onSave(JSON.stringify(editableGeminiData, null, 2));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Részletes összehasonlítás - {fileName}</DialogTitle>
          <DialogDescription>
            Bal oldalt a Gemini által generált adatok (szerkeszthető), jobb oldalt a PDF-ből kinyert szöveg látható.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-6 pt-4">
          <div className="border rounded p-4">
            <h3 className="mb-2 font-semibold">Gemini által generált adatok:</h3>
            <ScrollArea className="h-[50vh]">
              {renderGeminiData(editableGeminiData)}
            </ScrollArea>
          </div>
          <div className="border rounded p-4">
            <h3 className="mb-2 font-semibold">PDF-ből kinyert szöveg:</h3>
            <ScrollArea className="h-[50vh]">
              {renderPdfText()}
            </ScrollArea>
          </div>
        </div>
        <div className="flex justify-end space-x-2 p-6 pt-0">
          <Button variant="outline" onClick={onClose}>Mégse</Button>
          <Button onClick={handleSave}>Mentés</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default P14b1DetailedComparisonDialog;