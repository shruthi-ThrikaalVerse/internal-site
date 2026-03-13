import React, { useState } from 'react';
import DocumentManagement from './DocumentManagement';
import Documents from '../employee/Documents';

const AdminDocuments: React.FC = () => {
  const [showMyDocs, setShowMyDocs] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex justify-end p-4">
        <button
          className="px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow transition-all"
          style={{backgroundColor: '#c97a4c'}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}
          onClick={() => setShowMyDocs(true)}
        >
          My Documents
        </button>
      </div>
      {/* Main Document Management UI */}
      <div className={showMyDocs ? 'hidden' : ''}>
        <DocumentManagement />
      </div>
      {/* My Documents Modal (UI replica of employee portal) */}
      {showMyDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-[90vw] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
              <h2 className="text-2xl font-black text-black">My Documents</h2>
              <button
                className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
                onClick={() => setShowMyDocs(false)}
                aria-label="Close My Documents"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="h-[80vh] overflow-y-auto p-2">
              <Documents />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
