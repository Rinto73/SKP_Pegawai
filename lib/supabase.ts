
import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  // Hanya ambil dari Local Storage atau variabel global jika ada
  const savedConfig = localStorage.getItem('SUPABASE_CONFIG');
  const local = savedConfig ? JSON.parse(savedConfig) : null;

  // Default kosong untuk demo mode
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
