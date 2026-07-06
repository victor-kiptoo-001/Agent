import { GoogleGenAI, Type } from "@google/genai";



export async function parseUnstructuredOrder(rawText: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro", // Using the robust reasoning model
    contents: `Analyze the following unstructured merchant order message and extract the customer details and items ordered: \n\n"${rawText}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: orderExtractionSchema,
      systemInstruction: "You are an elite inventory automation assistant. Your job is to extract ordering details perfectly. If the item name is messy, extract the closest readable product name.",
    }
  });

  if (!response.text) throw new Error("Failed to get response from Gemini.");
  return JSON.parse(response.text);
}