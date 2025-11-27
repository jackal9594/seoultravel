import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, MessageRole } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert travel assistant for a mobile app called "Wanderlust AI".
Your target audience uses Traditional Chinese (zh-TW).
Keep responses concise, friendly, and formatted nicely with Markdown (bullet points, bold text).
When recommending places, try to include practical tips like best time to visit or local food.
If the user asks for an itinerary, structure it clearly by Day 1, Day 2, etc.
`;

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string
): Promise<{ text: string; sources: { title: string; uri: string }[] }> => {
  try {
    // Construct the chat history for context (simplification for stateless API call)
    // In a production app, we would use ai.chats.create() and maintain the session object.
    // Here we reconstruct the prompt to include context or use a fresh chat for simplicity in this demo structure.
    
    // Using generateContent with Search Grounding for up-to-date travel info
    const prompt = `
      Previous conversation context:
      ${history.map(m => `${m.role}: ${m.text}`).join('\n')}
      
      User's new request: ${newMessage}
      
      Please reply in Traditional Chinese (zh-TW).
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], // Enable Google Search for grounding
      },
    });

    const text = response.text || "抱歉，我現在無法回答您的問題，請稍後再試。";
    
    // Extract sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title,
        uri: c.web.uri
      }));

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "連線發生錯誤，請檢查您的網路或稍後再試。", 
      sources: [] 
    };
  }
};

export const generateDestinationDetails = async (destinationName: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `給我關於 "${destinationName}" 的旅遊簡介，包含3個必去景點和1個必吃美食。請用繁體中文，並使用Markdown格式。`,
        });
        return response.text || "無法取得資訊。";
    } catch (e) {
        console.error(e);
        return "載入詳細資訊失敗。";
    }
}
