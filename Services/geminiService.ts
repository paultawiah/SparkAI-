
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { UserProfile, Profile, ChatMessage, Event } from "../types";

const cleanJsonResponse = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// Fix: Add missing export getAiStatus which is imported in App.tsx
/**
 * Returns the current status of the AI service usage.
 * This is a simulated status for the demo.
 */
export const getAiStatus = () => {
  return { remaining: 15, isCoolingDown: false };
};

export const generateAiChatReply = async (
  match: Profile,
  user: UserProfile,
  lastMessage: string,
  history: ChatMessage[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historyContext = history.slice(-5).map(m => `${m.senderId === 'me' ? user.name : match.name}: ${m.text}`).join('\n');
  
  const prompt = `You are playing the role of ${match.name} on a dating app.
  Bio: ${match.bio}
  Interests: ${match.interests.join(', ')}
  Match's Name: ${user.name}
  Chat History: ${historyContext}
  Last Message from ${user.name}: "${lastMessage}"
  Respond in ${match.name}'s specific voice. 2 short sentences max.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  
  return response.text?.trim() || "That's so interesting! Tell me more?";
};

export interface DateSpot {
  name: string;
  description: string;
  why: string;
  uri?: string;
}

export const generateDateSpotSuggestions = async (
  userInterests: string[], 
  matchInterests: string[], 
  location: string,
  coords?: { latitude: number, longitude: number }
): Promise<{ spots: DateSpot[], sources: { uri: string, title: string }[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Suggest 3 specific date spots in ${location} for two people interested in ${userInterests.join(', ')} and ${matchInterests.join(', ')}. Format your response as a simple list.`;
  
  const config: any = {
    tools: [{ googleSearch: {} }, { googleMaps: {} }],
  };

  if (coords) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      }
    };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: config
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web || chunk.maps)
    .filter((source: any) => source && source.uri) || [];

  const lines = response.text?.split('\n').filter(l => l.trim().length > 0) || [];
  const spots: DateSpot[] = lines.slice(0, 3).map(line => ({
    name: line.split(':')[0] || "Local Highlight",
    description: line || "A highly recommended local experience.",
    why: "Matches your combined interests."
  }));

  return { spots, sources };
};

export const moderateContent = async (
  content: string | { data: string, mimeType: string },
  type: 'text' | 'image'
): Promise<{ isSafe: boolean, reason?: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];
  if (type === 'text') {
    parts.push({ text: `Analyze this dating message for toxicity: "${content}"` });
  } else {
    const imgContent = content as { data: string, mimeType: string };
    parts.push({ inlineData: { mimeType: imgContent.mimeType, data: imgContent.data } });
    parts.push({ text: "Check this profile photo for safety and policy compliance." });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: "Respond ONLY with JSON: {isSafe: boolean, reason: string}.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { isSafe: { type: Type.BOOLEAN }, reason: { type: Type.STRING } },
          required: ["isSafe"]
        }
      }
    });
    return JSON.parse(cleanJsonResponse(response.text || '{"isSafe": true}'));
  } catch {
    return { isSafe: true };
  }
};

export const generateDateVisualization = async (
  user: UserProfile,
  match: Profile
): Promise<{ imageUrl: string; description: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Create a cinematic visual of a dream first date between ${user.name} and ${match.name}. 
  Interests: ${user.interests.join(', ')} and ${match.interests.join(', ')}. 
  Include a romantic 2-sentence description.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  let imageUrl = '';
  let description = '';

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        description += part.text;
      }
    }
  }

  return {
    imageUrl: imageUrl || 'https://picsum.photos/seed/vision/800/450',
    description: description.trim() || "An unforgettable evening tailored to your shared passions."
  };
};

export const generateBio = async (interests: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a 2-sentence dating bio for someone who loves: ${interests.join(', ')}. Add 1 emoji.`,
  });
  return response.text?.trim() || "Exploring the best coffee spots and hidden trails.";
};

export const generateSparkPersona = async (interests: string[], relationshipGoal: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give this user a 3-word cool persona name based on: ${interests.join(', ')} and ${relationshipGoal}.`,
  });
  return response.text?.trim() || "Dynamic Soul Connector";
};

export const analyzeCompatibility = async (user: UserProfile, match: Profile): Promise<{ score: number, reason: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze compatibility between User (${user.interests.join(', ')}) and Match (${match.interests.join(', ')}). Return 0-100 score and brief reason.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, reason: { type: Type.STRING } },
        required: ["score", "reason"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '{"score": 75, "reason": "Great overlap in values."}'));
};

export const generateConversationStarters = async (user: UserProfile, match: Profile): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3 icebreakers for ${user.name} to message ${match.name} who loves ${match.interests.join(', ')}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '[]'));
};

export const getChatAdvice = async (user: UserProfile, match: Profile, history: ChatMessage[]): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historyString = history.slice(-4).map(m => `${m.senderId === 'me' ? 'User' : 'Match'}: ${m.text}`).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3 possible replies to continue this conversation: ${historyString}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '[]'));
};

export const verifyPhotoLiveness = async (imageBase64: string): Promise<{ isVerified: boolean, reason: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
        { text: "Liveness verification: Is this a real person? Return JSON {isVerified: bool, reason: str}." },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { isVerified: { type: Type.BOOLEAN }, reason: { type: Type.STRING } },
        required: ["isVerified", "reason"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '{"isVerified": false, "reason": "Processing Error"}'));
};

export const analyzePracticeSession = async (transcript: string[], scenario: string): Promise<{ summary: string, strengths: string[], weaknesses: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this dating app practice session: ${transcript.join('\n')}. Scenario: ${scenario}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "strengths", "weaknesses"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '{}'));
};

export const getEventRecommendations = async (user: UserProfile, events: Event[]): Promise<{ eventId: string, recommendation: string }[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Recommend 2 events from this list based on user interests (${user.interests.join(', ')}). List: ${JSON.stringify(events)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { eventId: { type: Type.STRING }, recommendation: { type: Type.STRING } },
          required: ["eventId", "recommendation"]
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '[]'));
};

export const getSpeedDateIcebreaker = async (user: UserProfile, match: Profile): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a fun speed dating icebreaker for a match who loves: ${match.interests.join(', ')}.`,
  });
  return response.text || "If you could travel anywhere tomorrow, where would it be?";
};
