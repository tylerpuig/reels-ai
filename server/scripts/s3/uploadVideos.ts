import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";
import { db } from "../db/utils.js";
import * as schema from "../../db/schema.js";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: "../../.env" });

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials not found");
}

export type VideoInfo = {
  title: string;
  description: string;
  path: string;
};
const videos: VideoInfo[] = [
  {
    title: "Most expensive house in IL",
    description:
      "Check out this video of the most expensive house in Illinois!",
    path: "most_expensive_il.mp4",
  },
  {
    title: "New York Penthouse",
    description: "Check out this video of the New York Penthouse!",
    path: "ny_video.mp4",
  },
  {
    title: "Penhoust Palace in Chicago",
    description: "Check out this video of the Penhoust Palace in Chicago!",
    path: "penhoust_palace_chi.mp4",
  },
];

// const fileNames = [
//   "most_expensive_il.mp4",
//   "ny_video.mp4",
//   "penhoust_palace_chi.mp4",
// ];

const bucketName = process.env.S3_BUCKET_NAME!;
const region = process.env.AWS_REGION!;
export const uploadVideoToS3 = async (localVideoPath: string) => {
  try {
    console.log("uploading to s3", localVideoPath);

    // First verify the file exists
    if (!fs.existsSync(localVideoPath)) {
      throw new Error(`File not found: ${localVideoPath}`);
    }

    // Get file stats before creating the stream
    const fileStats = fs.statSync(localVideoPath);

    const s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Read the file as a buffer instead of a stream
    const fileContent = fs.readFileSync(localVideoPath);
    const fileExtension = path.extname(localVideoPath) || ".mp4";
    const filename = `video-${Date.now()}${fileExtension}`;
    const contentType = mime.lookup(fileExtension) || "video/mp4";

    const uploadParams = {
      Bucket: bucketName,
      Key: filename,
      Body: fileContent, // Use the buffer instead of stream
      ContentType: contentType,
      ContentLength: fileStats.size,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`;
    console.log(s3Url);

    return s3Url;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

async function main() {
  for (const video of videos) {
    const localVideoPath = path.join(process.env.VIDEOS_PATH!, `${video.path}`);
    // console.log(localVideoPath);
    const s3Url = await uploadVideoToS3(video.path);
    const videoInfo: VideoInfo = {
      title: video.title,
      description: video.description,
      path: localVideoPath,
    };
    await insertVideo(videoInfo, s3Url);
  }
}
main();

export async function insertVideo(video: VideoInfo, s3Url: string) {
  try {
    // const randInt = Math.floor(Math.random() * 1000);
    await db.insert(schema.videosTable).values([
      {
        userId: "49969f3c-a3e5-4154-b7a5-d365daa338fc",
        title: video.title,
        description: video.description,
        videoUrl: s3Url,
      },
    ]);
  } catch (err) {
    console.log(err);
  }
}
