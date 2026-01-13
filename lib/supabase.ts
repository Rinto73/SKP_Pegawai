
import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  let vUrl = '';
  let vKey = '';
  
  try {
    // Gunakan pengecekan tipe yang sangat aman untuk lingkungan Vite
    // Fix: Access 'env' on import.meta using type assertion to avoid TypeScript error on standard ImportMeta interface (line 10 fix)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      // @ts-ignore
      vUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
      // @ts-ignore
      vKey = (import.meta as any).env.VITE_SUPABASE_KEY || '';
    }
  } catch (e) {
    // Diamkan error env agar tidak menghentikan aplikasi
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

// Buat client hanya jika konfigurasi benar-benar ada
export const supabase = isSupabaseConfigured 
  ? createClient(config.url, config.key) 
  : null;
