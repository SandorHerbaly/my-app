import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuClipboardPaste, LuCheck } from "react-icons/lu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronRight } from "lucide-react";

interface JsonTreeProps {
  data: any;
  level?: number;
}

const JsonTree: React.FC<JsonTreeProps> = ({ data, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (typeof data !== 'object' || data === null) {
    return <span className="text-green-600">{JSON.stringify(data)}</span>;
  }

  const entries = Object.entries(data);
  const pdfTextEntries = entries.filter(([key]) => key.endsWith('pdf-text'));
  const otherEntries = entries.filter(([key]) => !key.endsWith('pdf-text'));

  return (
    <div style={{ paddingLeft: level > 0 ? '1.5rem' : '0' }}>
      {otherEntries.map(([key, value]) => {
        if (key.startsWith('f-') && key !== 'f-00') return null;
        const isObject = typeof value === 'object' && value !== null;
        return (
          <div key={key}>
            <span 
              onClick={() => isObject && setIsOpen(!isOpen)}
              className={isObject ? "cursor-pointer" : ""}
            >
              {isObject && (isOpen ? <ChevronDown className="inline w-4 h-4" /> : <ChevronRight className="inline w-4 h-4" />)}
              <span className="text-red-500">{key}:</span> 
              {!isObject && <JsonTree data={value} />}
            </span>
            {isObject && isOpen && (
              <JsonTree data={value} level={level + 1} />
            )}
          </div>
        );
      })}
      {pdfTextEntries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          {pdfTextEntries.map(([key, value]) => (
            <div key={key} className="mt-2">
              <span className="text-red-500">{key}:</span> 
              <pre className="text-green-600 whitespace-pre-wrap mt-2 bg-gray-100 p-2 rounded">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ... (A többi kód változatlan marad)

const removePdfTextFields = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removePdfTextFields(item));
  }
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!key.endsWith('pdf-text')) {
      result[key] = removePdfTextFields(value);
    }
  }
  return result;
};

interface P2bS3JsonViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jsonContent: string;
  aiFileName: string;
}

const P2bS3JsonViewerDialog: React.FC<P2bS3JsonViewerDialogProps> = ({ isOpen, onClose, jsonContent, aiFileName }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const parsedJson = useMemo(() => {
    try {
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }, [jsonContent]);

  const handleCopy = () => {
    if (parsedJson) {
      const jsonWithoutPdfText = removePdfTextFields(parsedJson);
      const contentToCopy = JSON.stringify(jsonWithoutPdfText, null, 2);
      navigator.clipboard.writeText(contentToCopy);
    } else {
      navigator.clipboard.writeText(jsonContent);
    }
    setIsCopied(true);
    toast({ 
      title: "Copied!",
      description: "JSON content (without pdf-text fields) copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => {
      setIsCopied(false);
      setIsTooltipVisible(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <span className="text-left text-xl font-bold mb-5">JSON Viewer</span>
          <DialogTitle className="flex justify-between items-start text-lg font-semibold mt-10">
            <span className="flex-1 text-left">{`AI-Invoices/${aiFileName}`}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onMouseEnter={() => setIsTooltipVisible(true)}
                    onMouseLeave={() => setIsTooltipVisible(false)}
                    onClick={handleCopy}
                  >
                    {isCopied ? (
                      <div className="rounded-full bg-green-500 p-1">
                        <LuCheck className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <LuClipboardPaste className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                {isTooltipVisible && !isCopied && (
                  <TooltipContent>
                    <p>Copy contents (without pdf-text)</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
          <div className="border-b border-gray-300 mt-2"></div>
        </DialogHeader>
        <div className="bg-white p-4 rounded-md overflow-auto max-h-[calc(80vh-200px)]">
          {parsedJson ? (
            <JsonTree data={parsedJson} />
          ) : (
            <pre className="text-sm text-blue-600 whitespace-pre-wrap">
              {jsonContent}
            </pre>
          )}
        </div>
        <DialogDescription className="sr-only">
          JSON content viewer for AI analysis results
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default P2bS3JsonViewerDialog;
