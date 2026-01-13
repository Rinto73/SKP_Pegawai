
import React, { useState, useEffect } from 'react';
import { Database, Shield, Save, RefreshCw, Trash2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { getSupabaseConfig } from '../lib/supabase';

const Settings: React.FC = () => {
  const [config, setConfig] = useState({ url: '', key: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const current = getSupabaseConfig();
    setConfig({ url: current.url, key: current.key });
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
      
      // Reload aplikasi setelah jeda singkat agar client supabase terinisialisasi ulang
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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pengaturan Sistem</h1>
          <p className="text-slate-500 text-sm">Kelola koneksi database dan integrasi layanan pihak ketiga.</p>
        </div>
        <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
          <Database size={24} />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800">Konfigurasi Supabase</h3>
            <p className="text-xs text-slate-500">Hubungkan aplikasi dengan backend Supabase Anda sendiri.</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Supabase Project URL</label>
              <input 
                type="text" 
                placeholder="https://xyz.supabase.co"
                className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all bg-slate-50 text-black font-mono"
                value={config.url}
                onChange={e => setConfig({...config, url: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Supabase Anon Key (API Key)</label>
              <textarea 
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all bg-slate-50 text-black font-mono break-all"
                value={config.key}
                onChange={e => setConfig({...config, key: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div className="space-y-2">
                <p className="text-xs font-bold text-blue-800">Catatan Penting:</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Data ini disimpan di browser Anda (Local Storage). Jika Anda membersihkan data browser atau menggunakan Incognito, Anda perlu memasukkannya kembali.
                </p>
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  className="inline-flex items-center space-x-1 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  <span>Buka Dashboard Supabase</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {status === 'success' && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center space-x-3 border border-emerald-100 animate-in fade-in zoom-in-95">
              <CheckCircle2 size={20} />
              <p className="text-sm font-bold">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center space-x-3 border border-red-100 animate-in shake duration-300">
              <AlertTriangle size={20} />
              <p className="text-sm font-bold">{message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button 
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center space-x-2"
            >
              {status === 'saving' ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              <span className="text-xs uppercase tracking-widest">Simpan Perubahan</span>
            </button>
            <button 
              onClick={handleReset}
              className="px-6 py-4 border-2 border-slate-100 hover:bg-red-50 hover:border-red-100 text-slate-400 hover:text-red-600 rounded-2xl transition-all flex items-center justify-center"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h4 className="font-black text-lg mb-2">Google Gemini AI</h4>
          <p className="text-slate-400 text-sm mb-6">Layanan optimasi RHK otomatis menggunakan kecerdasan buatan.</p>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">API Key Status: Active (Environment)</span>
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase">Model: Gemini 3 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
