
import { createClient } from '@supabase/supabase-js';

// Fungsi helper untuk mengambil konfigurasi dari Vite env atau local storage
export const getSupabaseConfig = () => {
  // Mencoba mengambil dari import.meta.env (Vite/Vercel) atau process.env
  // @ts-ignore
  const vUrl = import.meta.env?.VITE_SUPABASE_URL;
  // @ts-ignore
  const vKey = import.meta.env?.VITE_SUPABASE_KEY;
  
  const envUrl = vUrl || process.env.SUPABASE_URL;
  const envKey = vKey || process.env.SUPABASE_ANON_KEY;
  
  // Local storage sebagai fallback atau override
  const savedConfig = localStorage.getItem('SUPABASE_CONFIG');
  const local = savedConfig ? JSON.parse(savedConfig) : null;

  const url = local?.url || envUrl || '';
  const key = local?.key || envKey || '';

  return {
    url,
    key,
    isConfigured: Boolean(url && key),
    source: local?.url ? 'Local Storage' : (vUrl ? 'Vercel/Vite Env' : 'Default')
  };
};

const config = getSupabaseConfig();

// Mengecek apakah konfigurasi sudah lengkap
export const isSupabaseConfigured = config.isConfigured;

// Inisialisasi client
export const supabase = isSupabaseConfigured 
  ? createClient(config.url, config.key) 
  : null as any;
