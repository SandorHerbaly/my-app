import React, { useState, useEffect } from 'react';
import { TbDatabaseImport, TbJson } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { P14b1DetailedComparisonDialog } from './P14b1-DetailedComparisonDialog';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase.config';

interface P14bProps {
  fileName: string;
  isImported: boolean;
}

export const P14b: React.FC<P14bProps> = ({ fileName, isImported }) => {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'error'>('pending');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [geminiData, setGeminiData] = useState('');
  const [pdfTextData, setPdfTextData] = useState('');

  useEffect(() => {
    if (isImported) {
      fetchData();
    }
  }, [isImported, fileName]);

  const fetchData = async () => {
    try {
      const docRef = doc(db, 'AI-Invoices', fileName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setGeminiData(JSON.stringify(data, null, 2));
        setPdfTextData(data['[f-001] pdf-text'] || 'PDF szöveg nem elérhető');
        setVerificationStatus(data.verificationStatus || 'pending');
      } else {
        console.log("No such document!");
        setVerificationStatus('error');
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setVerificationStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'pending': return 'text-orange-500';
      case 'verified': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleSave = async (updatedGeminiData: string) => {
    try {
      const docRef = doc(db, 'AI-Invoices', fileName);
      const updatedData = JSON.parse(updatedGeminiData);
      await updateDoc(docRef, {
        ...updatedData,
        verificationStatus: 'verified'
      });
      setVerificationStatus('verified');
      setGeminiData(updatedGeminiData);
    } catch (error) {
      console.error("Error updating document:", error);
      setVerificationStatus('error');
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <TbDatabaseImport className={`h-6 w-6 ${getStatusColor()}`} />
        <TbJson className={`h-6 w-6 ${getStatusColor()}`} />
        <Button variant="link" className={`p-0 ${getStatusColor()}`} onClick={() => setIsDialogOpen(true)}>
          {verificationStatus === 'pending' ? 'Ellenőrzés' : verificationStatus === 'error' ? 'Részletek' : 'Megtekintés'}
        </Button>
      </div>

      <P14b1DetailedComparisonDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        fileName={fileName}
        geminiData={geminiData}
        pdfTextData={pdfTextData}
        onSave={handleSave}
      />
    </>
  );
};

export default P14b;