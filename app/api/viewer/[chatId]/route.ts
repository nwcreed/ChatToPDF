// app/api/chat/[chatId]/pdf/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await context.params;

    // Récupérer le chat et ses fichiers
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        files: {
          select: {
            url: true,
            type: true,
          },
          where: {
            type: "application/pdf", // on filtre uniquement les PDFs
          },
        },
      },
    });

    if (!chat || chat.files.length === 0) {
      return NextResponse.json(
        { exists: false, message: "Chat non trouvé ou aucun PDF associé" },
        { status: 404 }
      );
    }

    // On prend le premier PDF trouvé
    const pdfUrl = chat.files[0].url;

    const res = await fetch(pdfUrl);
    if (!res.ok) {
      return NextResponse.json(
        { exists: false, message: "Impossible de récupérer le PDF" },
        { status: 500 }
      );
    }

    const blob = await res.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Erreur PDF API :", error);
    return NextResponse.json(
      { exists: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
