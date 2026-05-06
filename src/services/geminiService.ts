import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MemeCaption {
  topText: string;
  bottomText: string;
  context: string;
}

export async function generateMagicCaptions(imageBuffer: string, mimeType: string): Promise<MemeCaption[]> {
  const prompt = `Analyze this image and generate 5 funny, sarcastic, or culturally relevant meme captions. 
  For each meme, provide both 'topText' and 'bottomText'. 
  The captions should be in the classic meme style: relatable, witty, and slightly edgy but safe.
  Include a brief 'context' explaining why it's funny based on the image.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: imageBuffer.split(',')[1] || imageBuffer, // Handle both data URL and raw base64
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topText: { type: Type.STRING },
            bottomText: { type: Type.STRING },
            context: { type: Type.STRING },
          },
          required: ["topText", "bottomText", "context"],
        },
      },
    },
  });

  try {
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
}
