import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Define the strict structure we want back from the AI
export const orderExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    customerName: { type: Type.STRING, description: "Name of the person placing the order." },
    customerPhone: { type: Type.STRING, description: "Phone number if provided, otherwise null." },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productSkuOrName: { type: Type.STRING, description: "The SKU code or the name of the item ordered." },
          quantity: { type: Type.INTEGER, description: "The item quantity ordered." }
        },
        required: ["productSkuOrName", "quantity"]
      }
    }
  },
  required: ["customerName", "items"]
};

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
