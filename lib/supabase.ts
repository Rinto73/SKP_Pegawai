
import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  let vUrl = '';
  let vKey = '';
  
  try {
    // Akses aman untuk import.meta.env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      vUrl = import.meta.env.VITE_SUPABASE_URL || '';
      // @ts-ignore
      vKey = import.meta.env.VITE_SUPABASE_KEY || '';
    }
  } catch (e) {
    console.warn("Gagal mengakses import.meta.env");
  }
  
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

export const supabase = isSupabaseConfigured 
  ? createClient(config.url, config.key) 
  : null;
