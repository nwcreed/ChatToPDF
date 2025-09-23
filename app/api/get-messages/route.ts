import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ou "edge" si tu veux

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return new Response("Missing chatId", { status: 400 });
    }

    // Récupérer tous les messages du chat
    const _messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" }, // pour avoir les messages dans l'ordre chronologique
    });

    return NextResponse.json(_messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
