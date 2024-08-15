import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface DetailedComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  geminiData: string;
  pdfTextData: string;
  onSave: (updatedGeminiData: string, allCorrect: boolean) => void;
}

// Új függvény a dinamikus értéklekéréshez az objektumból
const getValueByPath = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => {
    // Távolítsuk el az esetleges felesleges szóközöket
    part = part.trim();
    // Ha a rész egy kulcs, de nem tartalmazza a [ ] karaktereket, akkor egyszerűen használjuk a kulcsot
    if (acc && acc[part]) {
      return acc[part];
    }
    // Ellenőrizzük, hogy van-e kulcs a négyzetes zárójelekben
    const match = part.match(/\[([^\]]+)\]/);
    if (match && acc) {
      return acc[match[1]];
    }
    return undefined;
  }, obj);
};

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
  const [editValue, setEditValue] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const rightScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedField(null); // Megnyitáskor nullázza a kijelölt mezőt

    try {
      const parsedData = JSON.parse(geminiData);
      // Remove f-001, f-47, and f-48 fields and sort the remaining fields
      const orderedData = Object.keys(parsedData)
        .filter(key => !['[f-001]', '[f-47]', '[f-48]'].includes(key))
        .sort() // Sort keys
        .reduce((obj, key) => {
          obj[key] = parsedData[key];
          return obj;
        }, {} as any);
      
      setEditableGeminiData(orderedData);
      compareDatas(orderedData);
    } catch (error) {
      console.error("Error parsing Gemini data:", error);
    }
  }, [geminiData, pdfTextData, isOpen]);

  const compareDatas = (parsedData: any) => {
    const diffs: string[] = [];
    Object.entries(parsedData).forEach(([key, value]) => {
      if (typeof value === 'string' && !pdfTextData.includes(value)) {
        diffs.push(key);
      }
    });
    setDifferences(diffs);
  };

  const handleEdit = (key: string, value: string) => {
    setEditingField(key);
    setEditValue(value);
  };

  const handleSaveEdit = () => {
    if (editingField) {
      const keys = editingField.split('.');
      let current = { ...editableGeminiData };
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = editValue;
      setEditableGeminiData(current);
      setEditingField(null);
      compareDatas(current);
    }
  };

  const findCorrectValue = (key: string, value: string) => {
    const fieldName = key.split(']')[1].trim();
    const regex = new RegExp(`${fieldName}:\\s*(\\S+)`, 'i');
    const match = pdfTextData.match(regex);
    return match ? match[1] : '';
  };

  const scrollToMatchingText = (text: string) => {
    if (rightScrollAreaRef.current) {
      let content = rightScrollAreaRef.current.textContent || '';
      let index = content.indexOf(text);

      if (index !== -1) {
        const range = document.createRange();
        let startNode: ChildNode | null = rightScrollAreaRef.current.firstChild;

        while (startNode) {
          if (startNode.nodeType === Node.TEXT_NODE) {
            const nodeText = startNode.textContent || '';
            const nodeLength = nodeText.length;

            if (index < nodeLength) {
              if (index + text.length <= nodeLength) {
                range.setStart(startNode, index);
                range.setEnd(startNode, index + text.length);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
                range.startContainer.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
              } else {
                console.warn("Index and text length exceed the node's length");
                return;
              }
            } else {
              index -= nodeLength;
            }
          }
          startNode = startNode.nextSibling;
        }
      } else {
        console.warn("Text not found in content");
      }
    }
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

      const correctValue = isDifferent ? findCorrectValue(key, value as string) : '';

      return (
        <div key={fullKey} className="ml-4">
          <span className="text-gray-700">{key}: </span>
          {editingField === fullKey ? (
            <div>
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className={`mt-1 w-full ${editValue !== correctValue ? 'border-red-500' : 'border-green-500'}`}
                rows={2}
              />
              <p className="text-sm text-gray-500 mt-1">Javaslat: {correctValue}</p>
              <Button
                onClick={handleSaveEdit}
                className="mt-2"
              >
                Mentés
              </Button>
            </div>
          ) : (
            <span
              className={`font-semibold cursor-pointer ${isDifferent ? 'text-red-500' : ''} ${selectedField === fullKey ? 'underline font-bold' : ''} hover:underline`}
              onClick={() => {
                setSelectedField(fullKey);
                scrollToMatchingText(value as string);
              }}
            >
              {value as string}
            </span>
          )}
        </div>
      );
    });
  };

  const renderPdfText = () => {
    const selectedText = selectedField ? getValueByPath(editableGeminiData, selectedField) : '';

    return pdfTextData.split('\n').map((line, index) => {
      const cleanLine = line.trim().toLowerCase();
      const cleanSelectedText = selectedText.trim().toLowerCase();

      const isHighlighted = cleanLine.includes(cleanSelectedText);

      return (
        <p key={index} className="mb-1">
          <span
            className={`${
              isHighlighted ? 'font-semibold text-black bg-[#64FF2D]' : ''
            }`}
          >
            {line}
          </span>
        </p>
      );
    });
  };

  const handleSave = () => {
    const allCorrect = differences.length === 0;
    onSave(JSON.stringify(editableGeminiData, null, 2), allCorrect);
    if (allCorrect) {
      onClose();
    }
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
              <div ref={rightScrollAreaRef}>
                {renderPdfText()}
              </div>
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
