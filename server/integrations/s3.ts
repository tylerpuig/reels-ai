import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrl(fileName: string) {
  try {
    const isMovFile = fileName.toLowerCase().endsWith(".mov");
    const contentType = isMovFile ? "video/quicktime" : "video/mp4";

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${Date.now()}-${fileName}`,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${command.input.Key}`;

    return { uploadUrl, fileUrl };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
  }
}
