import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto", // Cloudflare R2 n’utilise pas de région standard
  endpoint: process.env.AWS_S3_API_URL, // URL de ton compte R2
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
