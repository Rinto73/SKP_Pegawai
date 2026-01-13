
import React, { useState } from 'react';
import { Employee } from '../types';
import { LogIn, ShieldCheck } from 'lucide-react';

interface LoginProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
}

const Login: React.FC<LoginProps> = ({ employees, onLogin }) => {
  const [nip, setNip] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = employees.find(emp => emp.nip === nip);
    if (found) {
      onLogin(found);
    } else {
      setError('NIP tidak ditemukan. Gunakan NIP dari data pegawai (contoh: 197001011990011001)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
        <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
          <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">E-Kinerja SKP</h1>
          <p className="text-blue-100 text-sm mt-1 opacity-80 uppercase tracking-widest font-bold text-[10px]">Cascading Management System</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nomor Induk Pegawai (NIP)</label>
              <input 
                type="text" 
                required
                className={`w-full border-2 ${error ? 'border-red-200' : 'border-slate-100'} rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all bg-slate-50 text-black font-bold tracking-wider`}
                placeholder="Masukkan NIP Anda..."
                value={nip}
                onChange={(e) => {
                  setNip(e.target.value);
                  setError('');
                }}
              />
              {error && <p className="text-[10px] text-red-500 mt-2 font-bold italic">{error}</p>}
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center space-x-3"
            >
              <span>MASUK KE SISTEM</span>
              <LogIn size={20} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Hubungi Admin BKPSDM jika Anda lupa NIP atau bermasalah dengan akun.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
