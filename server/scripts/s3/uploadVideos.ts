import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";
import { db } from "../db/utils";
import * as schema from "../../db/schema";
dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials not found");
}

type VideoInfo = {
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
const uploadVideoToS3 = async (localVideoPath: string) => {
  try {
    console.log("uploading to s3", localVideoPath);
    // AWS configuration
    const s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Read the file
    const fileStream = fs.createReadStream(localVideoPath);
    const fileExtension = path.extname(localVideoPath);

    // Generate unique filename
    const filename = `video-${Date.now()}${fileExtension}`;

    // Determine content type
    const contentType = mime.lookup(fileExtension) || "video/mp4";

    // Set up the upload parameters
    const uploadParams = {
      Bucket: bucketName,
      Key: filename,
      Body: fileStream,
      ContentType: contentType,
      //   ACL: "public-read",
    };

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`;
    console.log(s3Url);

    return s3Url;

    // Return the URL of the uploaded video
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

async function main() {
  for (const video of videos) {
    const localVideoPath = path.join(
      __dirname,
      `../../../client/videos/${video.path}`
    );
    console.log(localVideoPath);
    const s3Url = await uploadVideoToS3(localVideoPath);
    await insertVideo(video, s3Url);
  }
}
main();

async function insertVideo(video: VideoInfo, s3Url: string) {
  try {
    // const randInt = Math.floor(Math.random() * 1000);
    await db.insert(schema.videosTable).values([
      {
        userId: 1,
        title: video.title,
        description: video.description,
        videoUrl: s3Url,
      },
    ]);
  } catch (err) {
    console.log(err);
  }
}
