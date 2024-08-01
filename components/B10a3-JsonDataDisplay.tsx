import React from 'react';

interface JsonDataDisplayProps {
  jsonData: any;
}

const JsonDataDisplay: React.FC<JsonDataDisplayProps> = ({ jsonData }) => {
  if (!jsonData) return null;

  return (
    <div className="bg-gray-100 rounded-lg p-4 mt-2">
      <h3 className="text-lg font-semibold mb-2">Invoice Data</h3>
      <div className="space-y-2">
        <p><strong>Invoice Number:</strong> {jsonData.invoice_number}</p>
        
        <div>
          <h4 className="font-semibold">Issuer</h4>
          <p>{jsonData.issuer.name}</p>
          <p>{jsonData.issuer.address.street}, {jsonData.issuer.address.zip} {jsonData.issuer.address.city}, {jsonData.issuer.address.country}</p>
          <p><strong>Tax Number:</strong> {jsonData.issuer.tax_number}</p>
          <p><strong>Bank Account:</strong> {jsonData.issuer.bank_account.account_number} ({jsonData.issuer.bank_account.bank})</p>
        </div>
        
        <div>
          <h4 className="font-semibold">Buyer</h4>
          <p>{jsonData.buyer.name}</p>
          <p>{jsonData.buyer.address.street}, {jsonData.buyer.address.zip} {jsonData.buyer.address.city}, {jsonData.buyer.address.country}</p>
          <p><strong>Tax Number:</strong> {jsonData.buyer.tax_number}</p>
        </div>
        
        <p><strong>Source:</strong> {jsonData.source}</p>
        <p><strong>Reference:</strong> {jsonData.reference}</p>
        
        <div>
          <h4 className="font-semibold">Dates</h4>
          <p><strong>Invoice Date:</strong> {jsonData.dates.invoice_date}</p>
          <p><strong>Performance Date:</strong> {jsonData.dates.performance_date}</p>
          <p><strong>Payment Due Date:</strong> {jsonData.dates.payment_due_date}</p>
        </div>
        
        <p><strong>Payment Terms:</strong> {jsonData.payment_terms}</p>
        
        {/* ... (rest of the JSON data display remains the same) */}
      </div>
    </div>
  );
};

export default JsonDataDisplay;