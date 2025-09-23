import { GoogleGenAI } from "@google/genai";

export async function getEmbeddings(text: string): Promise<number[]> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: [text],
    taskType: 'SEMANTIC_SIMILARITY',
  } as any); // on contourne TS

  if (!response.embeddings || !response.embeddings[0].values) {
    throw new Error("No embeddings returned");
  }

  const embedding = response.embeddings[0].values;

  // Tronquer à 1024 dimensions
  return embedding.slice(0, 1024);
}
