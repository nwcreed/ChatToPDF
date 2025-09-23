import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadR2IntoPinecone } from "@/lib/pinecone";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { fileIds } = body;

    // ✅ Vérification : il doit y avoir au moins un fichier
    if (!fileIds || fileIds.length === 0) {
      return NextResponse.json(
        { error: "Vous devez fournir au moins un fileId existant." },
        { status: 400 }
      );
    }

    // ✅ Vérifier que tous les fichiers existent
    const existingFiles = await prisma.file.findMany({
      where: { id: { in: fileIds } },
      select: { id: true, fileName: true },
    });

    if (existingFiles.length !== fileIds.length) {
      return NextResponse.json(
        { error: "Certains fichiers fournis n'existent pas." },
        { status: 400 }
      );
    }

    // ✅ Indexer chaque fichier dans Pinecone (optionnel)
    const pineconeResults = [];
    for (const file of existingFiles) {
      console.log(`Indexation du fichier ${file.fileName} dans Pinecone...`);
      const result = await loadR2IntoPinecone(file.fileName); // ou fileKey selon ton upload
      pineconeResults.push({ fileId: file.id, result });
    }

    // ✅ Créer le chat et connecter les fichiers existants
    const chat = await prisma.chat.create({
      data: {
        files: {
          connect: existingFiles.map((f) => ({ id: f.id })),
        },
      },
      include: {
        files: true,
      },
    });

    // ✅ Retourner un résultat combiné
    return NextResponse.json({
      success: true,
      pineconeResults,
       chatId: chat.id,
      chat,
    }, { status: 201 });

  } catch (err: any) {
    console.error("Erreur API create-chat-from-files :", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
