import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  const [editableGeminiData, setEditableGeminiData] = useState(geminiData);

  useEffect(() => {
    setEditableGeminiData(geminiData);
  }, [geminiData]);

  const handleSave = () => {
    onSave(editableGeminiData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Részletes összehasonlítás - {fileName}</DialogTitle>
          <DialogDescription>
            Bal oldalt a Gemini által generált adatok (szerkeszthető), jobb oldalt a PDF-ből kinyert szöveg látható.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="mb-2 font-semibold">Gemini által generált adatok:</h3>
            <Textarea
              value={editableGeminiData}
              onChange={(e) => setEditableGeminiData(e.target.value)}
              className="h-[60vh] font-mono"
            />
          </div>
          <div>
            <h3 className="mb-2 font-semibold">PDF-ből kinyert szöveg:</h3>
            <Textarea
              value={pdfTextData}
              readOnly
              className="h-[60vh] font-mono bg-gray-100"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Mégse</Button>
          <Button onClick={handleSave}>Mentés</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default P14b1DetailedComparisonDialog;