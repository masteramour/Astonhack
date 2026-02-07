
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const chatWithGemini = async (message: string, history: { role: string, parts: { text: string }[] }[] = []) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are the friendly 8vents chatbot. You help users navigate the event management platform called 8vents. 8vents is an octopus-themed platform for finding volunteers and managing events. You should be helpful, enthusiastic, and provide information about volunteering, donating, and community events. Use octopus puns occasionally.",
      }
    });
    return response.text || "I'm having a little trouble thinking right now. Could you try again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! My ink ran out. I couldn't reach the server.";
  }
};
