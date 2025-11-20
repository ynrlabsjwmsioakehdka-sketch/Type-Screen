
import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enhanceTextToRetro = async (inputText: string): Promise<string> => {
  if (!inputText.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following text to sound like a cryptic, urgent, or poetic message found on a vintage 90s pager or an old noir typewriter note. Keep it brief and atmospheric. Input: "${inputText}"`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 100,
      }
    });

    return response.text?.trim() || inputText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return inputText; // Fallback to original text on error
  }
};

export const generateRetroImage = async (promptText: string): Promise<string | null> => {
  if (!promptText.trim()) return null;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A simple, vintage, retro-style monochrome or limited color palette illustration, stamp, or pixel art icon representing the concept: "${promptText}". Minimalist, high contrast, woodblock print or 8-bit style. White background.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
};
