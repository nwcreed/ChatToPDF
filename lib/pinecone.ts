// lib/r2-to-pinecone.ts
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import md5 from "md5";
import fs from "fs";
import path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./r2"; // ton client R2
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

// --- Télécharger depuis R2 ---
async function downloadFromR2(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileKey,
  });

  const response = await r2.send(command);
  if (!response.Body) throw new Error("Fichier introuvable sur R2");

  const filePath = path.join("/tmp", fileKey);
  const writeStream = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    (response.Body as any).pipe(writeStream);
    (response.Body as any).on("end", resolve);
    (response.Body as any).on("error", reject);
  });

  return filePath;
}

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadR2IntoPinecone(fileKey: string) {
  // 1. Télécharger le PDF depuis R2
  console.log("downloading R2 into file system");
  const filePath = await downloadFromR2(fileKey);
  if (!filePath) throw new Error("could not download from R2");

  // 2. Charger le PDF
  console.log("loading pdf into memory " + filePath);
  const loader = new PDFLoader(filePath);
  const pages = (await loader.load()) as PDFPage[];

  // 3. Split et segment
  const documents = await Promise.all(pages.map(prepareDocument));

  // 4. Construire les records avec embeddings
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 5. Upload vers Pinecone
  const client = await getPineconeClient();
  const pineconeIndex = client.index("file-embeddings"); // ton index
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);

  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent); // <--- embedding ajouté
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
