import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// 🔑 Client R2
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.AWS_S3_API_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const fileId = params.id;

  if (!fileId) {
    return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
  }

  try {
    // 🔹 Supprimer dans Prisma
    const file = await prisma.file.delete({
      where: { id: fileId },
    });

    // 🔹 Supprimer dans R2
    await r2.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: file.fileName, // fileName = clé stockée en R2
      })
    );

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Failed to delete file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
