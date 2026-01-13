
import React from 'react';
import { LayoutDashboard, Users, GitMerge, FileText, Settings, LogOut, ChevronRight, ShieldAlert, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Employee, Role } from '../types';

const Layout: React.FC<{ 
  children: React.ReactNode; 
  currentUser: Employee; 
  onLogout: () => void 
}> = ({ children, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = currentUser.role === Role.ADMIN;
  
  const mainNavItems = isAdmin ? [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Cascading Matrix', icon: <GitMerge size={20} />, path: '/matrix' },
    { name: 'SKP Saya', icon: <FileText size={20} />, path: '/my-skp' },
  ] : [
    { name: 'SKP Saya', icon: <FileText size={20} />, path: '/my-skp' },
  ];

  const adminNavItems = isAdmin ? [
    { name: 'Manajemen Pegawai', icon: <Users size={20} />, path: '/employees' },
    { name: 'Pengaturan Sistem', icon: <Settings size={20} />, path: '/settings' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 bg-slate-900 text-white flex flex-col sticky top-0 h-screen shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GitMerge size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white uppercase">
              E-KINERJA
            </h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">Pemerintah Daerah</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">
              {isAdmin ? 'Menu Administrator' : 'Menu Pegawai'}
            </p>
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}>
                    {item.icon}
                  </span>
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                </div>
                {location.pathname === item.path && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            ))}
          </div>

          {isAdmin && adminNavItems.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 px-4 flex items-center space-x-2">
                <ShieldAlert size={12} />
                <span>Pengaturan Sistem</span>
              </p>
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    location.pathname === item.path 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}>
                      {item.icon}
                    </span>
                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  </div>
                  {location.pathname === item.path && <ChevronRight size={14} className="opacity-50" />}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 border border-slate-600">
                <User size={20} />
              </div>
              {isAdmin && (
                <div className="absolute -top-1 -right-1 bg-emerald-500 border-2 border-slate-900 rounded-full p-0.5">
                  <ShieldAlert size={10} className="text-white" />
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate text-white">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate font-medium uppercase tracking-tighter">{currentUser.nip}</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 p-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-5 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Sesi Anda</p>
            <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase">
              {isAdmin ? 'Mode Administrator' : 'Portal Pegawai (SKP)'}
            </h2>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.position}</p>
              <div className="flex items-center space-x-1 mt-1">
                {isAdmin ? (
                  <span className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">
                    <ShieldAlert size={10} />
                    <span>SUPER ADMIN</span>
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">
                    {currentUser.role}
                  </span>
                )}
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={() => navigate('/settings')}
                className={`p-3 rounded-2xl transition-colors border shadow-sm ${
                  location.pathname === '/settings' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'text-slate-400 hover:bg-slate-100 border-slate-100'
                }`}
              >
                <Settings size={20} />
              </button>
            )}
          </div>
        </header>
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
