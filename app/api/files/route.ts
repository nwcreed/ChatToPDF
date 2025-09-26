import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma"; // Assure-toi d’avoir créé lib/prisma.ts

// Initialisation du client S3/R2
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.AWS_S3_API_URL ?? "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const files: File[] = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    console.log(`📦 Received ${files.length} file(s) for upload`);

    // Upload R2 + sauvegarde DB
    const uploadPromises = files.map(async (file: File) => {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${uuidv4()}-${file.name}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
          })
        );

        const fileUrl = `${process.env.AWS_PUBLIC_URL}${process.env.AWS_S3_BUCKET_NAME}/${fileName}`;

        // ✅ Enregistrer dans Prisma
        const savedFile = await prisma.file.create({
          data: {
            originalName: file.name,
            fileName,
            url: fileUrl,
            size: file.size,
            type: file.type,
          },
        });

        console.log(`✅ File uploaded and saved: ${file.name} -> ${fileName}`);

        return {
          success: true,
          originalName: file.name,
          fileName,
          url: fileUrl,
          size: file.size,
          type: file.type,
          id: savedFile.id,
        };
      } catch (error) {
        console.error(`❌ Error uploading ${file.name}:`, error);
        return { success: false, originalName: file.name, error: `Erreur lors de l'upload de ${file.name}` };
      }
    });

    const results = await Promise.allSettled(uploadPromises);

    const successful: any[] = [];
    const failed: any[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        if (result.value.success) successful.push(result.value);
        else failed.push(result.value);
      } else {
        failed.push({ success: false, originalName: files[index].name, error: `Erreur lors de l'upload de ${files[index].name}` });
      }
    });

    console.log(`✅ Upload completed: ${successful.length} successful, ${failed.length} failed`);

    const response = {
      success: successful.length > 0,
      total: files.length,
      successful: successful.length,
      failed: failed.length,
      urls: successful.map(item => item.url),
      files: successful,
      errors: failed,
    };

    if (successful.length === 0)
      return NextResponse.json({ ...response, error: "Tous les uploads ont échoué" }, { status: 500 });
    if (failed.length > 0)
      return NextResponse.json({ ...response, warning: `${failed.length} fichier(s) n'ont pas pu être uploadés` }, { status: 207 });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("❌ POST - Global error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur lors de l'upload" }, { status: 500 });
  }
};
