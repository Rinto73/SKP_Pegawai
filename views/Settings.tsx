
import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, Save, RefreshCw, Trash2, Globe, CheckCircle2, Link2, ExternalLink, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { getSupabaseConfig, isSupabaseConfigured } from '../lib/supabase';

const Settings: React.FC = () => {
  const [config, setConfig] = useState({ url: '', key: '' });
  const [source, setSource] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const current = getSupabaseConfig();
    setConfig({ url: current.url, key: current.key });
    setSource(current.source);
    setIsConfigured(current.isConfigured);
  }, []);

  const handleSave = () => {
    setStatus('saving');
    try {
      if (!config.url.startsWith('https://')) {
        throw new Error("URL Supabase harus diawali dengan https://");
      }
      if (config.key.length < 20) {
        throw new Error("API Key (Anon Key) tampaknya tidak valid.");
      }

      localStorage.setItem('SUPABASE_CONFIG', JSON.stringify(config));
      setStatus('success');
      setMessage('Konfigurasi berhasil disimpan. Aplikasi akan memuat ulang...');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || "Gagal menyimpan konfigurasi.");
    }
  };

  const handleReset = () => {
    if (confirm("Putus koneksi dan hapus konfigurasi kustom?")) {
      localStorage.removeItem('SUPABASE_CONFIG');
      window.location.reload();
    }
  };

  const maskUrl = (url: string) => {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.hostname.replace(/[^.]/g, (c, i) => i < 3 ? c : '*')}`;
    } catch {
      return 'URL tidak valid';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengaturan Infrastruktur</h1>
          <p className="text-slate-500 text-sm font-medium">Manajemen koneksi database dan integrasi sistem e-Kinerja.</p>
        </div>
        <div className="bg-slate-100 p-4 rounded-3xl text-slate-400 border border-slate-200 shadow-inner">
          <Database size={28} />
        </div>
      </div>

      {isConfigured ? (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          {/* Status Panel Utama */}
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-32 -mt-32"></div>
            
            <div className="p-10 flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="relative">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-2xl animate-bounce-slow">
                  <Database size={40} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={18} />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Database Online</h2>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Koneksi Terverifikasi</span>
                </div>
              </div>

              <div className="w-full max-w-md grid grid-cols-1 gap-4 pt-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left flex items-start space-x-4">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-slate-400 shadow-sm">
                    <Link2 size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Host Endpoint</p>
                    <p className="text-sm font-bold text-slate-700 font-mono tracking-tight">{maskUrl(config.url)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left flex items-start space-x-4">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-slate-400 shadow-sm">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sumber Konfigurasi</p>
                    <p className="text-sm font-bold text-slate-700">{source}</p>
                  </div>
                </div>
              </div>

              {source !== 'Vercel/Vite Env' ? (
                <button 
                  onClick={handleReset}
                  className="mt-6 flex items-center space-x-2 text-red-500 hover:text-red-700 font-black text-[10px] uppercase tracking-widest transition-colors py-2 px-6 hover:bg-red-50 rounded-full"
                >
                  <Trash2 size={14} />
                  <span>Putus Koneksi & Reset</span>
                </button>
              ) : (
                <div className="mt-6 px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center space-x-3">
                  <AlertTriangle size={16} className="text-indigo-600" />
                  <p className="text-[10px] text-indigo-700 font-black uppercase tracking-tight">Input Manual Terkunci oleh Environment Variable</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-10 py-6 border-t border-slate-100 flex justify-center">
               <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
                  <ExternalLink size={14} />
                  <span>MANAJEMEN DATA MELALUI PANEL SUPABASE DASHBOARD</span>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-5">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center border border-blue-200 shadow-sm">
              <Shield size={32} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl tracking-tight">Setup Koneksi Baru</h3>
              <p className="text-xs text-slate-500 font-medium">Hubungkan aplikasi dengan database Supabase Anda.</p>
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="max-w-2xl space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Supabase Project URL</label>
                <input 
                  type="text" 
                  placeholder="https://xyz.supabase.co"
                  className="w-full border-2 border-slate-100 rounded-3xl p-5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50 text-black font-mono shadow-inner"
                  value={config.url}
                  onChange={e => setConfig({...config, url: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Supabase Anon Key</label>
                <textarea 
                  rows={4}
                  placeholder="Masukkan Anon Key (API Key) proyek Anda..."
                  className="w-full border-2 border-slate-100 rounded-3xl p-5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50 text-black font-mono break-all leading-relaxed shadow-inner"
                  value={config.key}
                  onChange={e => setConfig({...config, key: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <button 
                onClick={handleSave}
                disabled={status === 'saving'}
                className="w-full max-w-md bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all flex items-center justify-center space-x-4 active:scale-95"
              >
                {status === 'saving' ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
                <span className="text-sm uppercase tracking-[0.2em]">Aktifkan Koneksi</span>
              </button>
            </div>
            
            {status === 'success' && (
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 size={18} />
                  <span>{message}</span>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center space-x-3">
                  <AlertTriangle size={18} />
                  <span>{message}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Settings;
