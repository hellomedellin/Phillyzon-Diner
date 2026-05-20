import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

const accountId = process.env.R2_ACCOUNT_ID!;
const bucket = process.env.R2_BUCKET_NAME!;
const publicUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  buffer: Buffer,
  mimetype: string,
  originalName: string,
): Promise<string> {
  const ext = path.extname(originalName) || ".jpg";
  const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    }),
  );

  return `${publicUrl}/${key}`;
}

export async function deleteFromS3(imageUrl: string): Promise<void> {
  const key = imageUrl.replace(`${publicUrl}/`, "");
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
