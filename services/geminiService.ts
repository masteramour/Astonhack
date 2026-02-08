import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const chatWithGemini = async (message: string, history: { role: string, parts: { text: string }[] }[] = []) => {
  if (!ai) {
    console.warn('Gemini API key not configured');
    return getFallbackResponse(message);
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
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

export const generateVolunteerMessage = async (volunteerName: string, userMessage: string, volunteerSkills: string[], volunteerBio: string) => {
  if (!ai) {
    return `Hi ${volunteerName},\n\n${userMessage}\n\nLooking forward to connecting with you!\n\nBest regards`;
  }

  try {
    const prompt = `Generate a friendly, professional message to a volunteer named ${volunteerName}. 
Their skills: ${volunteerSkills.join(', ')}
Their bio: ${volunteerBio}
User's message intent: ${userMessage}

Create a warm, personalized message (2-3 short paragraphs) that:
1. Greets them by name
2. References their specific skills or interests
3. Incorporates the user's message intent naturally
4. Ends with an enthusiastic call-to-action
5. Keep it under 150 words
6. Use a friendly, community-focused tone`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    return response.text || `Hi ${volunteerName},\n\n${userMessage}\n\nLooking forward to connecting!`;
  } catch (error) {
    console.error('Gemini message generation error:', error);
    return `Hi ${volunteerName},\n\n${userMessage}\n\nLooking forward to connecting with you!\n\nBest regards`;
  }
}

// Fallback responses when API is unavailable
const getFallbackResponse = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes('event')) {
    return "Check out our Events page to find community events near you! 🐙";
  }
  if (lower.includes('volunteer')) {
    return "Head to the Volunteers page to connect with amazing helpers in your community!";
  }
  if (lower.includes('donate')) {
    return "Visit our Donate page to support causes you care about!";
  }
  if (lower.includes('help')) {
    return "I can help you navigate 8vents! Try asking about events, volunteers, or donations.";
  }
  return "I'm currently in offline mode, but you can explore Events, Volunteers, and Donations using the navigation above! 🐙";
};
