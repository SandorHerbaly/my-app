import React from 'react';

interface JsonDataDisplayProps {
  jsonData: any;
}

const B10a3JsonDataDisplay: React.FC<JsonDataDisplayProps> = ({ jsonData }) => {
  if (!jsonData) return <p>No data available for this invoice.</p>;

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Invoice Data</h3>
      <pre>{JSON.stringify(jsonData, null, 2)}</pre>
    </div>
  );
};

export default B10a3JsonDataDisplay;
