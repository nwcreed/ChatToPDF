import { prisma } from "@/lib/prisma";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { getContext } from "@/lib/context";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Récupérer le chatId depuis l'URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/"); // ["", "api", "chat", "chatId"]
    const chatId = pathSegments[pathSegments.length - 1];

    // Vérifier si le chat existe et récupérer les fileName associés
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        files: {
          select: { fileName: true },
          orderBy: { createdAt: 'asc' } // facultatif : prendre le premier fichier ajouté
        },
      },
    });

    if (!chat || chat.files.length === 0) {
      return new Response("Chat or files not found", { status: 404 });
    }

    const fileName = chat.files[0].fileName; // on utilise le premier fileName
    console.log("Using fileName as fileKey:", fileName);

    // Récupération du body
    const body = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return new Response("Missing 'messages'", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      return new Response("Last message is empty", { status: 400 });
    }

    // Récupérer le contexte à partir du fichier
    let contextText = "";
    try {
      contextText = await getContext(lastMessage.content, fileName);
      console.log("Context retrieved (preview):", contextText.slice(0, 200));
    } catch (ctxError) {
      console.error("Error fetching context:", ctxError);
    }

  const systemPrompt = `
You are an AI assistant specialized in answering questions from PDF documents.

Your task:
- Use only the information inside the CONTEXT BLOCK.
- Analyze and reason about the information in the context to provide **complete, structured, and insightful answers**.
- If the answer is explicitly in the context, explain it clearly and concisely.
- If the context allows you to logically deduce additional insights without inventing facts, do so carefully.
- If the answer cannot be found or deduced from the context, reply: "I'm sorry, but I don't know the answer to that question."

Rules:
- NEVER invent facts that are not present in the context.
- ALWAYS base your response on the content provided in the CONTEXT BLOCK.
- Prefer quoting or paraphrasing relevant parts from the document to support your reasoning.
- Keep answers structured, detailed, and easy to read.

START CONTEXT BLOCK
${contextText || "No context available"}
END OF CONTEXT BLOCK

`;


    // Appel Gemini
    const aiStream = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages,
    });

    return aiStream.toTextStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat/[chatId]:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
