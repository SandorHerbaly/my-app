"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp } from 'lucide-react';

interface UploadCardProps {
  title: string;
  count: number;
  lastUpload: string;
  onUpload: () => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ title, count, lastUpload, onUpload }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <span className="text-2xl font-bold">{count}</span>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground">Last upload: {lastUpload}</p>
      <Button onClick={onUpload} className="w-full mt-2">
        <FileUp className="mr-2 h-4 w-4" /> Upload {title.toLowerCase().replace('uploaded ', '')}
      </Button>
    </CardContent>
  </Card>
);

interface P2S1CardUploadPdfReceiptsProps {
  cards: {
    title: string;
    count: number;
    lastUpload: string;
  }[];
  onUpload: (title: string) => void;
}

const P2S1CardUploadPdfReceipts: React.FC<P2S1CardUploadPdfReceiptsProps> = ({ cards, onUpload }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <UploadCard
          key={index}
          title={card.title}
          count={card.count}
          lastUpload={card.lastUpload}
          onUpload={() => onUpload(card.title)}
        />
      ))}
    </div>
  );
};

export default P2S1CardUploadPdfReceipts;