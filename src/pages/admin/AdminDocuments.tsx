import React, { useState } from 'react';
import Documents from '../employee/Documents.tsx';

const AdminDocuments: React.FC = () => {
  // This component simply renders the employee Documents UI for admin documents
  // You can add admin-specific logic or data fetching here if needed
  return (
    <div className="min-h-screen bg-slate-50">
      <Documents />
    </div>
  );
};

export default AdminDocuments;
