import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface JsonDataDisplayProps {
  jsonData: any;
}

const B10a3JsonDataDisplay: React.FC<JsonDataDisplayProps> = ({ jsonData }) => {
  if (!jsonData) return null;

  return (
    <div className="h-[400px]">
      <h3 className="text-lg font-medium mb-4">Invoice Data</h3>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Invoice Number:</p>
            <p>{jsonData.invoice_number}</p>
          </div>
          
          <div>
            <p className="font-semibold">Issuer:</p>
            <p>{jsonData.issuer.name}</p>
            <p>{jsonData.issuer.address.street}, {jsonData.issuer.address.zip} {jsonData.issuer.address.city}, {jsonData.issuer.address.country}</p>
            <p>Tax Number: {jsonData.issuer.tax_number}</p>
            <p>Bank Account: {jsonData.issuer.bank_account.account_number} ({jsonData.issuer.bank_account.bank})</p>
          </div>
          
          <div>
            <p className="font-semibold">Buyer:</p>
            <p>{jsonData.buyer.name}</p>
            <p>{jsonData.buyer.address.street}, {jsonData.buyer.address.zip} {jsonData.buyer.address.city}, {jsonData.buyer.address.country}</p>
            <p>Tax Number: {jsonData.buyer.tax_number}</p>
          </div>
          
          <div>
            <p className="font-semibold">Dates:</p>
            <p>Invoice Date: {jsonData.dates.invoice_date}</p>
            <p>Performance Date: {jsonData.dates.performance_date}</p>
            <p>Payment Due Date: {jsonData.dates.payment_due_date}</p>
          </div>
          
          <div>
            <p className="font-semibold">Totals:</p>
            <p>Net Amount: {jsonData.totals.net_amount}</p>
            <p>Tax Amount: {jsonData.totals.tax_amount}</p>
            <p>Gross Amount: {jsonData.totals.gross_amount}</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default B10a3JsonDataDisplay;