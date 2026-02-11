import React, { useState } from 'react';


type RequestItem = {
  id: string;
  employeeName: string;
  subject: string;
  message: string; // request description
  createdAt: string;
  status: 'approved' | 'rejected' | 'inprogress';
};

const initialData: RequestItem[] = [
  {
    id: 'r1',
    employeeName: 'Asha Verma',
    subject: 'Hardware Replacement',
    message: 'My laptop charger stopped working. Requesting a replacement.',
    createdAt: '2026-02-10 09:12',
    status: 'inprogress'
  },
  {
    id: 'r2',
    employeeName: 'Ravi Kumar',
    subject: 'Request for Training',
    message: 'Would like to attend the cloud-native training next month.',
    createdAt: '2026-02-09 15:34',
    status: 'approved'
  },
  {
    id: 'r3',
    employeeName: 'Nina Shah',
    subject: 'Access to Repo',
    message: 'Need read access to the analytics repo for onboarding tasks.',
    createdAt: '2026-02-08 11:00',
    status: 'inprogress'
  }
];

const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>(initialData);

  const setStatus = (id: string, status: RequestItem['status']) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const statusBadge = (status: RequestItem['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      case 'inprogress':
      default:
        return 'bg-yellow-50 text-yellow-700';
    }
  };

  return (
  
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-black">Employee Requests</h1>

        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">From: <span className="font-medium text-gray-800">{req.employeeName}</span></div>
                  <div className="text-lg font-semibold mt-1 text-black">{req.subject}</div>
                  <div className="text-sm text-gray-600 mt-2">{req.message}</div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <div className='text-black'>{req.createdAt}</div>
                  <div className={`mt-2 px-2 py-1 rounded-full text-xs ${statusBadge(req.status)}`}>
                    {req.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatus(req.id, 'approved')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setStatus(req.id, 'rejected')}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setStatus(req.id, 'inprogress')}
                    className="px-3 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50"
                  >
                    In Progress
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
};

export default AdminRequestsPage;
