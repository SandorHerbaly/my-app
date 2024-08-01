import React from 'react';

interface JsonDataDisplayProps {
  jsonData: any;
}

const JsonDataDisplay: React.FC<JsonDataDisplayProps> = ({ jsonData }) => {
  if (!jsonData) return null;

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Invoice Data</h3>
      <div className="space-y-2">
        <p><strong>Invoice Number:</strong> {jsonData.invoice_number}</p>
        <p><strong>Invoice Date:</strong> {jsonData.invoice_date}</p>
        <p><strong>Due Date:</strong> {jsonData.due_date}</p>
        
        <div>
          <h4 className="font-semibold">Issuer:</h4>
          <p>{jsonData.issuer.name}</p>
          <p>{jsonData.issuer.address.street}</p>
          <p>{jsonData.issuer.address.zip} {jsonData.issuer.address.city}, {jsonData.issuer.address.country}</p>
          <p>Tax Number: {jsonData.issuer.tax_number}</p>
        </div>
        
        <div>
          <h4 className="font-semibold">Buyer:</h4>
          <p>{jsonData.buyer.name}</p>
          <p>{jsonData.buyer.address.street}</p>
          <p>{jsonData.buyer.address.zip} {jsonData.buyer.address.city}, {jsonData.buyer.address.country}</p>
          <p>Tax Number: {jsonData.buyer.tax_number}</p>
        </div>
        
        <div>
          <h4 className="font-semibold">Items:</h4>
          {jsonData.items.map((item, index) => (
            <div key={index} className="ml-4">
              <p>{item.description}</p>
              <p>Quantity: {item.quantity}, Unit Price: {item.unit_price}</p>
              <p>Net Amount: {item.net_amount}, VAT: {item.vat_amount}, Gross: {item.gross_amount}</p>
            </div>
          ))}
        </div>
        
        <div>
          <h4 className="font-semibold">Total:</h4>
          <p>Net Amount: {jsonData.total.net_amount}</p>
          <p>VAT Amount: {jsonData.total.vat_amount}</p>
          <p>Gross Amount: {jsonData.total.gross_amount}</p>
        </div>
      </div>
    </div>
  );
};

export default JsonDataDisplay;