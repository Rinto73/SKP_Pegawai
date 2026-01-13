
import { GoogleGenAI, Type } from "@google/genai";
import { RHK, Role } from "../types";

export const suggestInterventionRhk = async (
  parentRhk: RHK, 
  subordinateRole: Role, 
  subordinatePosition: string
) => {
  // Pastikan process.env.API_KEY tersedia sebelum inisialisasi
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;

  if (!apiKey) {
    console.error("Gemini API Key (process.env.API_KEY) tidak ditemukan.");
    return null;
  }

  // Sesuai aturan: Gunakan process.env.API_KEY langsung saat inisialisasi
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
