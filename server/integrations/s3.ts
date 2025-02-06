import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import {
  awsRegion,
  s3BucketName,
  awsAccessKeyId,
  awsSecretAccessKey,
} from "../scripts/constants.js";
// import dotenv from "dotenv";
// dotenv.config({ path: "../.env" });

const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

export async function generatePresignedUrl(fileName: string) {
  try {
    const isMovFile = fileName.toLowerCase().endsWith(".mov");
    const contentType = isMovFile ? "video/quicktime" : "video/mp4";

    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: `${Date.now()}-${fileName}`,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    const fileUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/${command.input.Key}`;

    return { uploadUrl, fileUrl };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
  }
}

export async function uploadImageToS3FromUrl(
  imageUrl: string,
  fileName: string
) {
  try {
    // Fetch the image
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: `${Date.now()}-${fileName}`,
      Body: response.data,
      ContentType: "image/jpeg",
    });

    await s3Client.send(command);

    // Return the S3 URL
    return `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/${command.input.Key}`;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw error;
  }
}
