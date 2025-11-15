import { GoogleGenAI, Modality, Chat, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });
let chat: Chat | null = null;

const langMap: { [key: string]: string } = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'pt': 'Portuguese'
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const suggestTitle = async (description: string, language: string): Promise<string> => {
  const langName = langMap[language as keyof typeof langMap] || 'English';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Suggest a catchy, short title (max 5 words) in ${langName} for a tour with this description: "${description}"`,
    });
    return response.text.trim().replace(/"/g, '');
  } catch (error) {
    console.error("Error suggesting title:", error);
    return "AI suggestion failed.";
  }
};

export const generateDescription = async (prompt: string, language: string): Promise<string> => {
    const langName = langMap[language as keyof typeof langMap] || 'English';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a compelling, one-paragraph tour description in ${langName} based on these keywords: "${prompt}"`,
        });
        return response.text;
    // FIX: Added curly braces to the catch block for correct syntax.
    } catch (error) {
        console.error("Error generating description:", error);
        return "Failed to generate description from AI.";
    }
};

export const findPointsOfInterest = async (location: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `List 5 interesting points of interest or stops for a tourist route near ${location}.`,
            config: {
                tools: [{googleMaps: {}}],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error with Maps Grounding:", error);
        return "Could not retrieve points of interest.";
    }
};

export const generatePromotionalImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A vibrant, professional photograph for a travel brochure. ${prompt}`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};


export const editImageWithPrompt = async (imageFile: File, prompt: string): Promise<string | null> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};

export const startChat = (language: string) => {
  const langName = langMap[language as keyof typeof langMap] || 'English';

  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a helpful travel planning assistant. Your responses must be in ${langName}. Help the user create tour packages and routes. Be concise and friendly.`,
    },
  });
};

export const sendMessageToChat = async (message: string): Promise<GenerateContentResponse | null> => {
  if (!chat) {
    startChat('en');
  }
  try {
    if (chat) {
        const response = await chat.sendMessage({ message });
        return response;
    }
    return null
  } catch (error) {
    console.error("Error sending chat message:", error);
    return null;
  }
};


export interface RouteCalculationResult {
    kilometers: number;
    durationHours: number;
    quantities: {
        guide: number;
        medical: number;
        transport: number;
        logistics: number;
    }
}

export const calculateRouteDetails = async (stopNames: string[]): Promise<RouteCalculationResult | null> => {
    if (stopNames.length < 2) return null;

    const stopsList = stopNames.join(', ');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `For a one-day tourist route visiting these stops in order: ${stopsList}, provide realistic estimates for the following. The route starts at the first stop and ends at the last.
            - Total travel distance in kilometers.
            - Total duration in hours, including travel and visiting time.
            - Estimated quantity of professional guides needed.
            - Estimated quantity of medical kits/support units needed per person.
            - Estimated quantity of private vehicles (e.g., a van) needed.
            - Estimated quantity of logistics units (e.g., water/snack packs) needed per person.
            Return ONLY a JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        kilometers: {
                            type: Type.NUMBER,
                            description: "Total travel distance in kilometers for the route."
                        },
                        durationHours: {
                            type: Type.NUMBER,
                            description: "Total estimated duration for the tour in hours."
                        },
                        quantities: {
                            type: Type.OBJECT,
                            properties: {
                                guide: {
                                    type: Type.NUMBER,
                                    description: "Estimated number of guides."
                                },
                                medical: {
                                    type: Type.NUMBER,
                                    description: "Estimated medical kits per person."
                                },
                                transport: {
                                    type: Type.NUMBER,
                                    description: "Estimated number of vehicles."
                                },
                                logistics: {
                                    type: Type.NUMBER,
                                    description: "Estimated logistics units per person."
                                },
                            },
                        },
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as RouteCalculationResult;

    } catch (error) {
        console.error("Error calculating route details:", error);
        return null;
    }
};