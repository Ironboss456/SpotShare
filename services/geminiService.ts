import { GoogleGenAI } from "@google/genai";
import { AIChatMessage, GroundingSource } from "../types";

// Helper to safely get API key
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API_KEY is missing from environment variables.");
    return "";
  }
  return key;
};

export const searchAmenities = async (
  query: string,
  userLat: number,
  userLng: number
): Promise<AIChatMessage> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      role: "model",
      text: "I'm sorry, I cannot connect to the service right now. Please check the API configuration.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find amenities matching this description near the user's location: "${query}". Provide a helpful list and summary.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: userLat,
              longitude: userLng,
            },
          },
        },
      },
    });

    const text = response.text || "I found some information, but couldn't generate a summary.";
    
    // Extract grounding chunks for sources
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
           sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
        
        if (chunk.maps?.uri) {
          sources.push({ title: chunk.maps.title || 'Google Maps Location', uri: chunk.maps.uri });
        }
      });
    }

    return {
      role: "model",
      text,
      sources,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      role: "model",
      text: "I encountered an error while searching for amenities. Please try again.",
    };
  }
};