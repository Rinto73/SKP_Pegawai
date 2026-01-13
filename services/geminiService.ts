
import { RHK, Role } from "../types";

// NOTE: Menggunakan dynamic import untuk @google/genai
// Hal ini mencegah aplikasi crash (White Screen) saat loading awal jika terjadi masalah dependensi.

/**
 * Memberikan saran intervensi RHK menggunakan Gemini AI.
 * Menghasilkan judul, deskripsi, dan indikator yang selaras dengan RHK atasan.
 */
export const suggestInterventionRhk = async (
  parentRhk: RHK, 
  subordinateRole: Role, 
  subordinatePosition: string
) => {
  // 1. Validasi API Key
  let apiKey = undefined;
  try {
    if (typeof process !== "undefined" && process.env) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {}

  if (!apiKey) {
    console.warn("API Key tidak ditemukan. Fitur AI dinonaktifkan.");
    return null;
  }

  try {
    // 2. Load Library secara Dinamis (Lazy Load)
    // @ts-ignore
    const module = await import("@google/genai");
    const { GoogleGenAI, Type } = module;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Berikan saran intervensi Rencana Hasil Kerja (RHK) untuk bawahan berdasarkan RHK atasan berikut:
      
      RHK Atasan: "${parentRhk.title}"
      Deskripsi Atasan: "${parentRhk.description}"
      
      Profil Bawahan:
      - Jabatan: ${subordinatePosition}
      - Role: ${subordinateRole}
      
      Tujuan: Buat 1 RHK intervensi yang selaras dengan RHK atasan dan sesuai dengan tugas pokok bawahan. 
      Sertakan juga minimal 2 Indikator Kinerja Individu (IKI) yang relevan (Aspek: Kualitas, Kuantitas, Waktu, atau Biaya).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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

    const jsonStr = response.text;
    if (!jsonStr) return null;
    
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Gemini AI Service Error:", error);
    return null;
  }
};
