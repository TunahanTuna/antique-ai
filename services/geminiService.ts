import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { AntiqueAnalysis } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The specific name of the item (e.g., 'Late Victorian Mahogany Side Table')." },
    estimatedDate: { type: Type.STRING, description: "The estimated era or specific year range (e.g., 'Circa 1890-1910')." },
    origin: { type: Type.STRING, description: "Country or region of origin." },
    style: { type: Type.STRING, description: "Art movement or style (e.g., Art Deco, Baroque, Mid-Century Modern)." },
    confidenceScore: { type: Type.NUMBER, description: "Confidence score between 0 and 100." },
    estimatedValue: {
      type: Type.OBJECT,
      properties: {
        min: { type: Type.NUMBER },
        max: { type: Type.NUMBER },
        currency: { type: Type.STRING, description: "Currency code, prefer USD or EUR." }
      }
    },
    description: { type: Type.STRING, description: "Detailed physical description and identification features." },
    restorationTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific advice on cleaning, maintaining, or restoring this item without damaging value."
    },
    historicalContext: { type: Type.STRING, description: "Brief history about why this item is significant or interesting." },
    detailedHistory: { type: Type.STRING, description: "A comprehensive historical background of the item's era, maker, or style. Provide 2-3 detailed paragraphs explaining its cultural and historical significance." },
    searchQueries: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 distinct search queries for Google to find similar items, auction results, or historical records (e.g., 'Victorian mahogany side table auction results', '19th century English furniture makers')."
    },
    keyFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-5 specific visual or constructional features that identify this item's history (e.g., 'Dovetail joints', 'Cabriole legs')."
    },
    isAuthentic: { type: Type.BOOLEAN, description: "Does it appear to be an authentic vintage/antique item based on visual cues?" }
  },
  required: ["title", "estimatedDate", "origin", "estimatedValue", "description", "restorationTips", "historicalContext", "detailedHistory", "searchQueries", "keyFeatures"],
};

export const analyzeImage = async (base64Image: string): Promise<AntiqueAnalysis> => {
  if (!apiKey) {
    throw new Error("API Anahtarı eksik. Lütfen ortam değişkenlerini kontrol edin.");
  }

  // Remove data URL prefix if present for clean base64
  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64
          }
        },
        {
          text: "You are a world-class antique appraiser and historian. Analyze this image deeply. Identify the object, its probable era, origin, and estimated market value range for collectors. Provide restoration tips, detailed historical context, and search queries for further research. If it looks like a modern reproduction, note that in the description."
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert antique valuator. Be precise, conservative with value estimates, and helpful with restoration advice. Always respond in Turkish language within the JSON structure values.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI yanıtı boş.");

    return JSON.parse(text) as AntiqueAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Antika analizi yapılamadı. Lütfen tekrar deneyin.");
  }
};

export const createRestorationChat = (analysis: AntiqueAnalysis): Chat => {
  if (!apiKey) {
    throw new Error("API Anahtarı eksik.");
  }

  const context = `
    Sen uzman bir antika restoratörü ve sanat tarihi uzmanısın. Şu an aşağıdaki özelliklere sahip bir eseri inceliyoruz:
    
    Eser Adı: ${analysis.title}
    Tahmini Dönem: ${analysis.estimatedDate}
    Köken: ${analysis.origin}
    Stil: ${analysis.style}
    Malzeme/Özellikler: ${analysis.keyFeatures.join(', ')}
    Orijinallik Durumu: ${analysis.isAuthentic ? 'Orijinal görünüyor' : 'Reprodüksiyon olabilir'}
    
    Kullanıcı sana bu eserle ilgili bakım, onarım, temizlik veya koruma hakkında sorular soracak.
    Verdiğin cevaplar profesyonel, korumacı yaklaşımı benimseyen ve eserin değerini düşürmeyecek nitelikte olmalı.
    Eğer kullanıcı esere zarar verebilecek bir işlem sorarsa (örn: verniklemek, sert kimyasalla silmek), onu uyar ve profesyonel yardım almasını öner.
    Cevapların kısa, net ve Türkçe olsun.

    ÖNEMLİ: Her cevabının en sonunda, kullanıcının konuyla ilgili sorabileceği, sohbeti ilerletecek 3 kısa takip sorusu öner.
    Bu önerileri şu formatta, cevabın geri kalanından ayırarak ver:
    |||SUGGESTIONS_START|||["Örnek Soru 1?", "Örnek Soru 2?", "Örnek Soru 3?"]|||SUGGESTIONS_END|||
  `;

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: context,
    }
  });
};