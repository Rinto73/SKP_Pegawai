
import { createClient } from '@supabase/supabase-js';

// Fungsi helper untuk mengambil konfigurasi dari env atau local storage
export const getSupabaseConfig = () => {
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_ANON_KEY;
  
  const savedConfig = localStorage.getItem('SUPABASE_CONFIG');
  const local = savedConfig ? JSON.parse(savedConfig) : null;

  const url = envUrl || local?.url || '';
  const key = envKey || local?.key || '';

  return {
    url,
    key,
    isConfigured: Boolean(url && key)
  };
};

const config = getSupabaseConfig();

// Mengecek apakah konfigurasi sudah lengkap
export const isSupabaseConfigured = config.isConfigured;

// Inisialisasi client
export const supabase = isSupabaseConfigured 
  ? createClient(config.url, config.key) 
  : null as any;
