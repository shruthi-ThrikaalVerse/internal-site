import React from 'react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import Icon from './Icon.tsx';

const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useHRMS();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {(notifications || []).map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border min-w-[300px] animate-in slide-in-from-right-full duration-300 ${n.type === 'success' ? 'bg-white border-green-100' :
              n.type === 'warning' ? 'bg-white border-yellow-100' :
                n.type === 'error' ? 'bg-white border-red-100' : 'bg-white border-blue-100'
            }`}
        >
          <div className={`p-2 rounded-xl ${n.type === 'success' ? 'bg-green-50 text-green-600' :
              n.type === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                n.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}>
            <Icon name={
              n.type === 'success' ? 'CheckCircle' :
                n.type === 'warning' ? 'AlertTriangle' :
                  n.type === 'error' ? 'XCircle' : 'Info'
            } className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">{n.message}</p>
            <p className="text-[10px] text-gray-400">{n.timestamp}</p>
          </div>

          <button aria-label="Dismiss notification" onClick={() => dismissNotification(n.id)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-300 transition-colors">
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
