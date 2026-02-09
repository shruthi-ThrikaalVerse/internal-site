import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import Icon from './Icon.tsx';

const Sidebar: React.FC<{ isOpen: boolean; setOpen: (val: boolean) => void }> = ({ isOpen, setOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname.replace(/^\/(admin\/)?/, '') || 'admin/dashboard';

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center gap-2 border-b">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">H</div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">Admin <span className="text-indigo-600">Sync</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto invisible-scrollbar">
          {(NAV_ITEMS || []).map((item) => (
            <Link
              key={item.id}
              to={`/${item.id}`}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${currentPath === item.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xl shadow-indigo-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
                }`}
            >
              <Icon name={item.icon} className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 font-bold text-sm hover:bg-rose-50 transition-all active:scale-95"
          >
            <Icon name="LogOut" className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
