
import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  // Gunakan import.meta.env untuk Vite
  // @ts-ignore
  const vUrl = import.meta.env?.VITE_SUPABASE_URL;
  // @ts-ignore
  const vKey = import.meta.env?.VITE_SUPABASE_KEY;
  
  // Fallback untuk local storage override
  const savedConfig = localStorage.getItem('SUPABASE_CONFIG');
  const local = savedConfig ? JSON.parse(savedConfig) : null;

  const url = local?.url || vUrl || '';
  const key = local?.key || vKey || '';

  return {
    url,
    key,
    isConfigured: Boolean(url && key),
    source: local?.url ? 'Local Storage' : (vUrl ? 'Vercel/Vite Env' : 'Default')
  };
};

const config = getSupabaseConfig();

export const isSupabaseConfigured = config.isConfigured;

// Inisialisasi client dengan pengecekan aman
export const supabase = isSupabaseConfigured 
  ? createClient(config.url, config.key) 
  : null as any;
