
import { GoogleGenAI, Type } from "@google/genai";
import { RHK, Role } from "../types";

/**
 * Memberikan saran intervensi RHK menggunakan Gemini AI.
 * Menghasilkan judul, deskripsi, dan indikator yang selaras dengan RHK atasan.
 */
export const suggestInterventionRhk = async (
  parentRhk: RHK, 
  subordinateRole: Role, 
  subordinatePosition: string
) => {
  // Fix: Initialize Google GenAI with the API key directly from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `Berikan saran intervensi Rencana Hasil Kerja (RHK) untuk bawahan berdasarkan RHK atasan berikut:
      
      RHK Atasan: "${parentRhk.title}"
      Deskripsi Atasan: "${parentRhk.description}"
      
      Profil Bawahan:
      - Jabatan: ${subordinatePosition}
      - Role: ${subordinateRole}
      
      Tujuan: Buat 1 RHK intervensi yang selaras dengan RHK atasan dan sesuai dengan tugas pokok bawahan. 
      Sertakan juga minimal 2 Indikator Kinerja Individu (IKI) yang relevan (Aspek: Kualitas, Kuantitas, Waktu, atau Biaya).`;

    // Fix: Using gemini-3-pro-preview for advanced reasoning and organizational alignment.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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

    // Fix: Access the extracted string directly from the 'text' property.
    const jsonStr = response.text;
    if (!jsonStr) return null;
    
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Gemini AI Service Error:", error);
    return null;
  }
};
