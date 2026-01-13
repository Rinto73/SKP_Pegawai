
import { GoogleGenAI, Type } from "@google/genai";
import { RHK, Role } from "../types";

// NOTE: Jangan inisialisasi client di level global module karena akan menyebabkan crash (White Screen)
// jika process.env.API_KEY tidak ada saat aplikasi dimuat pertama kali.

/**
 * Memberikan saran intervensi RHK menggunakan Gemini AI.
 * Menghasilkan judul, deskripsi, dan indikator yang selaras dengan RHK atasan.
 */
export const suggestInterventionRhk = async (
  parentRhk: RHK, 
  subordinateRole: Role, 
  subordinatePosition: string
) => {
  // 1. Validasi API Key sebelum mencoba inisialisasi
  // Menggunakan try-catch atau pengecekan aman untuk process.env
  let apiKey = undefined;
  try {
    if (typeof process !== "undefined" && process.env) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    // Abaikan error jika process tidak terdefinisi
  }

  if (!apiKey) {
    console.warn("Gemini API Key (process.env.API_KEY) tidak ditemukan atau kosong. Fitur AI dinonaktifkan.");
    // Mengembalikan null agar aplikasi tetap berjalan normal tanpa fitur AI
    return null;
  }

  try {
    // 2. Inisialisasi client HANYA saat dibutuhkan (Lazy Initialization)
    // Ini mencegah error "API Key required" saat load aplikasi awal
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Berikan saran intervensi Rencana Hasil Kerja (RHK) untuk bawahan berdasarkan RHK atasan berikut:
      
      RHK Atasan: "${parentRhk.title}"
      Deskripsi Atasan: "${parentRhk.description}"
      
      Profil Bawahan:
      - Jabatan: ${subordinatePosition}
      - Role: ${subordinateRole}
      
      Tujuan: Buat 1 RHK intervensi yang selaras dengan RHK atasan dan sesuai dengan tugas pokok bawahan. 
      Sertakan juga minimal 2 Indikator Kinerja Individu (IKI) yang relevan (Aspek: Kualitas, Kuantitas, Waktu, atau Biaya).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Judul RHK yang disarankan' },
            description: { type: Type.STRING, description: 'Deskripsi RHK yang disarankan' },
            indicators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: 'Uraian indikator' },
                  target: { type: Type.STRING, description: 'Target capaian' },
                  perspective: { type: Type.STRING, description: 'Aspek (Kualitas/Kuantitas/Waktu/Biaya)' }
                },
                required: ['text', 'target', 'perspective']
              }
            }
          },
          required: ['title', 'description', 'indicators']
        }
      }
    });

    // Extract text directly from property (not method) as per guidelines
    const jsonStr = response.text;
    if (!jsonStr) return null;
    
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Return null agar UI tidak crash, hanya fitur saran yang gagal
    return null;
  }
};
