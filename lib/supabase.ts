
import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  // 1. Cek Environment Variables (Vercel/Vite/Global)
  const envUrl = (process.env as any).SUPABASE_URL;
  const envKey = (process.env as any).SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return {
      url: envUrl,
      key: envKey,
      isConfigured: true,
      source: 'Vercel/Vite Env'
    };
  }

  // 2. Fallback ke Local Storage (Input manual dari menu Settings)
  const savedConfig = localStorage.getItem('SUPABASE_CONFIG');
  const local = savedConfig ? JSON.parse(savedConfig) : null;

  const url = local?.url || '';
  const key = local?.key || '';

  return {
    url,
    key,
    isConfigured: Boolean(url && key),
    source: local?.url ? 'Local Storage' : 'None'
  };
};

const config = getSupabaseConfig();

export const isSupabaseConfigured = config.isConfigured;

// Inisialisasi client secara aman
let supabaseInstance = null;
if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(config.url, config.key);
  } catch (e) {
    console.error("Supabase Init Error:", e);
  }
}

export const supabase = supabaseInstance;
