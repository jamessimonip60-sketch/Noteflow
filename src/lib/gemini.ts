import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateText(prompt: string, systemInstruction?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function analyzeImage(prompt: string, base64Data: string, mimeType: string = "image/jpeg") {
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [imagePart, { text: prompt }] },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
}

export async function transcribeAndSummarizeAudio(base64Data: string, mimeType: string = "audio/webm") {
  try {
    const audioPart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { 
        parts: [
          audioPart, 
          { text: "Please transcribe this meeting recording and provide a clear, structured summary with key takeaways and action items. Format the output in clean HTML (using tags like <h2>, <p>, <ul>, <li>, <strong>, <em>)." }
        ] 
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Audio Error:", error);
    throw error;
  }
}
