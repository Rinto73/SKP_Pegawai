
import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  // Akses aman untuk import.meta.env (Vite)
  // @ts-ignore
  const vUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
  // @ts-ignore
  const vKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_KEY : '';
  
  // Local storage sebagai override manual jika dibutuhkan
  const savedConfig = localStorage.getItem('SUPABASE_CONFIG');
  const local = savedConfig ? JSON.parse(savedConfig) : null;

  const url = local?.url || vUrl || '';
  const key = local?.key || vKey || '';

  return {
    url,
    key,
    isConfigured: Boolean(url && key),
    source: local?.url ? 'Local Storage' : (vUrl ? 'Vercel/Vite Env' : 'None')
  };
};

const config = getSupabaseConfig();

export const isSupabaseConfigured = config.isConfigured;

// Inisialisasi client hanya jika konfigurasi valid
export const supabase = isSupabaseConfigured 
  ? createClient(config.url, config.key) 
  : null as any;
