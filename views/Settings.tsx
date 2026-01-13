
import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, Save, RefreshCw, Trash2, CheckCircle2, 
  AlertTriangle, ExternalLink, UserPlus, Server, Code, Copy, Check, Globe 
} from 'lucide-react';
import { getSupabaseConfig, supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_EMPLOYEES } from '../constants';

const Settings: React.FC = () => {
  const [config, setConfig] = useState({ url: '', key: '' });
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

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

  const copySql = () => {
    const sql = `-- 1. Buat Tabel Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nip TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  role TEXT NOT NULL,
  gender CHAR(1) CHECK (gender IN ('L', 'P')),
  superior_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Buat Tabel RHK (Rencana Hasil Kerja)
CREATE TABLE rhks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  parent_rhk_id UUID REFERENCES rhks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'Utama',
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Buat Tabel Indicators (IKI)
CREATE TABLE indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rhk_id UUID REFERENCES rhks(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  target TEXT NOT NULL,
  perspective TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MATIKAN RLS (Untuk kemudahan demo awal) atau buat policy
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE rhks ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow Public Read/Write" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Read/Write" ON rhks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Read/Write" ON indicators FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initializeAdmin = async () => {
    if (!isSupabaseConfigured) {
      alert("Konfigurasikan URL dan Key Supabase terlebih dahulu.");
      return;
    }

    setInitStatus('loading');
    try {
      const adminData = MOCK_EMPLOYEES.find(e => e.nip === 'admin123');
      if (!adminData) throw new Error("Data admin default tidak ditemukan.");

      const { error } = await supabase.from('employees').upsert([{
        nip: adminData.nip,
        name: adminData.name,
        position: adminData.position,
        role: adminData.role,
        gender: adminData.gender,
        superior_id: null
      }], { onConflict: 'nip' });

      if (error) throw error;

      setInitStatus('success');
      setTimeout(() => setInitStatus('idle'), 3000);
    } catch (err: any) {
      console.error(err);
      setInitStatus('error');
      alert(`Gagal Inject Data: ${err.message}\n\nPastikan Anda sudah menjalankan SQL Script di panel Supabase Dashboard.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Setup Database</h1>
          <p className="text-slate-500 text-sm">Integrasi sistem dengan infrastruktur backend Supabase.</p>
        </div>
        <div className="bg-slate-100 p-3 rounded-2xl text-slate-400">
          <Database size={28} />
        </div>
      </div>

      {/* Indikator Sumber Koneksi */}
      {source === 'Vercel/Vite Env' && (
        <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200 flex items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Globe size={24} />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-tight text-sm">Vercel Environment Detected</h4>
              <p className="text-[11px] text-emerald-100">Aplikasi terhubung secara otomatis menggunakan VITE_SUPABASE_URL & KEY.</p>
            </div>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl border border-white/20 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest">Status: Connected</span>
          </div>
        </div>
      )}

      {/* Bagian 1: Koneksi Supabase */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800">Kredensial API</h3>
            <p className="text-xs text-slate-500">Konfigurasi manual (Akan menimpa Vercel Env jika diisi).</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Project URL</label>
                <input 
                  type="text" 
                  placeholder="https://your-project.supabase.co"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all bg-slate-50 text-black font-mono"
                  value={config.url}
                  onChange={e => setConfig({...config, url: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">API Anon Key</label>
                <textarea 
                  rows={4}
                  placeholder="Paste your anon public key here..."
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all bg-slate-50 text-black font-mono break-all"
                  value={config.key}
                  onChange={e => setConfig({...config, key: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-blue-600 rounded-[1.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <div>
                <h4 className="font-black text-lg mb-4 flex items-center space-x-2">
                  <ExternalLink size={20} />
                  <span>Dapatkan Kunci</span>
                </h4>
                <ol className="text-xs space-y-3 text-blue-100 font-medium">
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-400/30 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>Buka <b>Supabase Dashboard</b></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-400/30 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>Pilih Project &gt; Project Settings</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-400/30 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <span>Klik menu <b>API</b> di sidebar</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-400/30 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <span>Salin URL dan <b>anon (public)</b> key</span>
                  </li>
                </ol>
              </div>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-6 w-full bg-white text-blue-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-blue-50 transition-colors"
              >
                Ke Dashboard Supabase
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
            <button 
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center space-x-2"
            >
              {status === 'saving' ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              <span className="text-xs uppercase tracking-widest">Simpan/Override Koneksi</span>
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

      {/* Bagian 2: SQL Editor & Schema */}
      <div className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <Code size={24} />
            </div>
            <div>
              <h3 className="font-black text-white">SQL Schema Guide</h3>
              <p className="text-xs text-slate-500">Jalankan skrip ini di <b>SQL Editor</b> Supabase Anda.</p>
            </div>
          </div>
          <button 
            onClick={copySql}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-blue-400 hover:bg-slate-700'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Berhasil Disalin' : 'Copy SQL Script'}</span>
          </button>
        </div>
        <div className="p-0">
          <div className="bg-slate-950 p-6 font-mono text-[11px] leading-relaxed overflow-x-auto h-[350px] relative">
            <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-700 uppercase select-none">Read Only Preview</div>
            <pre className="text-slate-400">
              <span className="text-blue-400">-- 1. Tabel Master Pegawai</span>{"\n"}
              <span className="text-emerald-400">CREATE TABLE</span> employees ({"\n"}
              {"  "}id <span className="text-purple-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),{"\n"}
              {"  "}nip <span className="text-purple-400">TEXT</span> UNIQUE NOT NULL,{"\n"}
              {"  "}name <span className="text-purple-400">TEXT</span> NOT NULL,{"\n"}
              {"  "}position <span className="text-purple-400">TEXT</span> NOT NULL,{"\n"}
              {"  "}role <span className="text-purple-400">TEXT</span> NOT NULL,{"\n"}
              {"  "}gender <span className="text-purple-400">CHAR(1)</span>,{"\n"}
              {"  "}superior_id <span className="text-purple-400">UUID</span> REFERENCES employees(id){"\n"}
              );{"\n\n"}
              <span className="text-blue-400">-- 2. Tabel RHK</span>{"\n"}
              <span className="text-emerald-400">CREATE TABLE</span> rhks ({"\n"}
              {"  "}id <span className="text-purple-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),{"\n"}
              {"  "}employee_id <span className="text-purple-400">UUID</span> REFERENCES employees(id),{"\n"}
              {"  "}title <span className="text-purple-400">TEXT</span> NOT NULL,{"\n"}
              {"  "}status <span className="text-purple-400">TEXT</span> DEFAULT 'Draft'{"\n"}
              );{"\n\n"}
              <span className="text-blue-400">-- 3. Tabel Indikator (IKI)</span>{"\n"}
              <span className="text-emerald-400">CREATE TABLE</span> indicators ({"\n"}
              {"  "}id <span className="text-purple-400">UUID</span> PRIMARY KEY DEFAULT gen_random_uuid(),{"\n"}
              {"  "}rhk_id <span className="text-purple-400">UUID</span> REFERENCES rhks(id) ON DELETE CASCADE,{"\n"}
              {"  "}text <span className="text-purple-400">TEXT</span> NOT NULL,{"\n"}
              {"  "}target <span className="text-purple-400">TEXT</span> NOT NULL{"\n"}
              );
            </pre>
          </div>
          <div className="p-8 bg-slate-900 border-t border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Data Seed Initializer</h4>
                <p className="text-xs text-slate-500">Inject data admin setelah tabel berhasil dibuat.</p>
              </div>
              <button 
                onClick={initializeAdmin}
                disabled={initStatus === 'loading' || !isSupabaseConfigured}
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${
                  initStatus === 'success' 
                  ? 'bg-emerald-500 text-white' 
                  : !isSupabaseConfigured
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/20 active:scale-95'
                }`}
              >
                {initStatus === 'loading' ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : initStatus === 'success' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Server size={18} />
                )}
                <span>{initStatus === 'success' ? 'Data Berhasil Di-Inject' : initStatus === 'loading' ? 'Memproses Data...' : 'Inject Admin Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
