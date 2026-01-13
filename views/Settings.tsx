
import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, Save, RefreshCw, Trash2, Globe 
} from 'lucide-react';
import { getSupabaseConfig, isSupabaseConfigured } from '../lib/supabase';

const Settings: React.FC = () => {
  const [config, setConfig] = useState({ url: '', key: '' });
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const current = getSupabaseConfig();
    setConfig({ url: current.url, key: current.key });
    setSource(current.source);
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
    if (confirm("Hapus semua konfigurasi koneksi kustom?")) {
      localStorage.removeItem('SUPABASE_CONFIG');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Koneksi Database</h1>
          <p className="text-slate-500 text-sm">Integrasi sistem dengan infrastruktur backend Supabase.</p>
        </div>
        <div className="bg-slate-100 p-4 rounded-2xl text-slate-400 border border-slate-200 shadow-inner">
          <Database size={28} />
        </div>
      </div>

      {source === 'Vercel/Vite Env' && (
        <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-100 flex items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="flex items-center space-x-5 relative z-10">
            <div className="bg-white/20 p-4 rounded-2xl border border-white/20 backdrop-blur-md">
              <Globe size={24} />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-1">Infrastruktur Terdeteksi</h4>
              <p className="text-sm text-emerald-100 font-medium">Sistem terhubung menggunakan Environment Variables pusat.</p>
            </div>
          </div>
          <div className="bg-white/10 px-6 py-2 rounded-xl border border-white/20 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest">Connected</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-5">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-sm">
            <Shield size={28} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">Konfigurasi API</h3>
            <p className="text-xs text-slate-500 font-medium">Input kredensial Supabase untuk database operasional.</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="max-w-2xl space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Supabase Project URL</label>
              <input 
                type="text" 
                placeholder="https://xyz.supabase.co"
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 text-black font-mono shadow-inner"
                value={config.url}
                onChange={e => setConfig({...config, url: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Supabase Anon Key</label>
              <textarea 
                rows={4}
                placeholder="Paste anon key here..."
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 text-black font-mono break-all leading-relaxed shadow-inner"
                value={config.key}
                onChange={e => setConfig({...config, key: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
            <button 
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex-1 max-w-md bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center space-x-3 active:scale-95"
            >
              {status === 'saving' ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              <span className="text-xs uppercase tracking-widest">Hubungkan Database</span>
            </button>
            <button 
              onClick={handleReset}
              className="px-8 py-4 bg-slate-50 border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-2xl transition-all flex items-center justify-center active:scale-95"
              title="Reset Kredensial"
            >
              <Trash2 size={20} />
            </button>
          </div>
          
          {status === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {message}
            </div>
          )}
          {status === 'error' && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
