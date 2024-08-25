"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


interface TableDataItem {
  filename: string;
  type: string;
  aiStatus: string;
  uploaded: string;
}

interface P2S2UploadedFinancialReceiptTableProps {
  title: string;
  description: string;
  data: TableDataItem[];
}

const P2S2UploadedFinancialReceiptTable: React.FC<P2S2UploadedFinancialReceiptTableProps> = ({
  title,
  description,
  data
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>AI Status</TableHead>
              <TableHead>Uploaded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.filename}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <Badge 
                    variant={row.aiStatus === "Analysed" ? "secondary" : "outline"}
                    className="w-24 justify-center"  // Fix the width and center the text
                  >
                    {row.aiStatus}
                  </Badge>
                </TableCell>
                <TableCell>{row.uploaded}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default P2S2UploadedFinancialReceiptTable;