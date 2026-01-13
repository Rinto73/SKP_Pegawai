
import React, { useState } from 'react';
import { LayoutDashboard, Users, GitMerge, FileText, Settings, LogOut, ShieldAlert, User, ChevronDown, Menu, X, Clock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Employee, Role } from '../types';

const Layout: React.FC<{ 
  children: React.ReactNode; 
  currentUser: Employee; 
  onLogout: () => void 
}> = ({ children, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = currentUser.role === Role.ADMIN;
  
  const navItems = isAdmin ? [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { name: 'Cascading Matrix', icon: <GitMerge size={18} />, path: '/matrix' },
    { name: 'PPPK Paruh Waktu', icon: <Clock size={18} />, path: '/part-time' },
    { name: 'SKP Saya', icon: <FileText size={18} />, path: '/my-skp' },
    { name: 'Pegawai', icon: <Users size={18} />, path: '/employees' },
  ] : [
    { name: 'SKP Saya', icon: <FileText size={18} />, path: '/my-skp' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* TOP NAVBAR */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-xl border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-4 shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer" onClick={() => navigate('/')}>
                <GitMerge size={22} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-black tracking-tighter text-white uppercase leading-none">
                  E-KINERJA
                </h1>
                <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest leading-none mt-1">Pemerintah Daerah</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 flex-1 px-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex flex-col items-end mr-2">
                <p className="text-xs font-black text-white leading-none">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter mt-1">{currentUser.position}</p>
              </div>

              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <button 
                    onClick={() => navigate('/settings')}
                    className={`p-2.5 rounded-xl transition-all border ${
                      location.pathname === '/settings' 
                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                      : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    title="Pengaturan Sistem"
                  >
                    <Settings size={18} />
                  </button>
                )}
                
                <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block"></div>
                
                <button 
                  onClick={onLogout}
                  className="p-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-slate-700 rounded-xl transition-all"
                  title="Keluar"
                >
                  <LogOut size={18} />
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-2 animate-in slide-in-from-top duration-200">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-4 rounded-xl text-sm font-bold transition-all ${
                  location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
