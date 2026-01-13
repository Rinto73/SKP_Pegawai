
import { GoogleGenAI, Type } from "@google/genai";
import { RHK, Role } from "../types";

// Fungsi aman untuk mendapatkan API Key dari process.env tanpa membuat aplikasi crash
const getApiKey = (): string => {
  try {
    // Menggunakan typeof process untuk mengecek eksistensi variabel global di browser
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("process.env tidak dapat diakses.");
  }
  return '';
};

const apiKey = getApiKey();
// Hanya inisialisasi jika key tersedia
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const suggestInterventionRhk = async (
  parentRhk: RHK, 
  subordinateRole: Role, 
  subordinatePosition: string
) => {
  if (!ai) {
    console.error("Gemini API Key (process.env.API_KEY) tidak ditemukan.");
    return null;
  }

  const prompt = `
    Sebagai ahli manajemen kinerja SDM Aparatur (SKP), buatkan Rencana Hasil Kerja (RHK) Intervensi untuk bawahan.
    
    RHK Pimpinan (Parent): "${parentRhk.title}"
    Deskripsi Pimpinan: "${parentRhk.description}"
    
    Posisi Bawahan: ${subordinatePosition}
    Level: ${subordinateRole}
    
    Berikan saran RHK yang spesifik, terukur, dan relevan (Cascading). 
    Berikan juga 2-3 indikator kinerja individu (IKI) untuk RHK tersebut.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            suggestedDescription: { type: Type.STRING },
            indicators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  target: { type: Type.STRING },
                  perspective: { type: Type.STRING }
                }
              }
            }
          },
          required: ["suggestedTitle", "suggestedDescription", "indicators"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
};
