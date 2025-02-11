import fs from "fs";
import openAI from "openai";
import { openAIApiKey } from "../../constants.js";
import path from "path";
import { pipeline } from "stream/promises";
import { db } from "../../../db/index.js";
import * as schema from "../../../db/schema.js";

const openai = new openAI({
  apiKey: openAIApiKey,
});

// Create output directory if it doesn't exist
const outputDir = "./frames";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
const videos: VideoInfo[] = [
  {
    id: 2,
    url: "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/penhoust_palace_chi.mp4",
  },
  {
    id: 3,
    url: "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/most_expensive_il.mp4",
  },
  {
    id: 4,
    url: "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/ny_video.mp4",
  },
  {
    id: 5,
    url: "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/The+house+vs+the+view+-+San+Diego.mp4",
  },
  {
    id: 6,
    url: "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/%23reels+%23interior+%23property+%23trend+%23whatsapp+%23inspiration+%23instrumental+%23short+%23beautiful+%23love+%23%F0%9F%94%A5%F0%9F%94%A5%F0%9F%94%A5.mp4",
  },
  {
    id: 7,
    url: "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/Beautiful+Las+Vegas+home+for+sale+!.mp4",
  },
  {
    id: 8,
    url: "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/Beautiful+interior+%23shorts+%23realestate.mp4",
  },
  {
    id: 9,
    url: "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/Let's+go+%F0%9F%A4%A9.+%23shorts+%23beautiful+%23home+%23pretty+%23luxury+%23realestate+%23interior.mp4",
  },
];

import { spawn } from "child_process";

function extractFramesAsBase64(inputVideo: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const frames: string[] = [];
    let buffer = Buffer.from([]);

    // Create FFmpeg command to output frames as images to pipe
    const ffmpegProcess = spawn("ffmpeg", [
      "-i",
      inputVideo,
      "-vf",
      "fps=1",
      "-f",
      "image2pipe",
      "-vcodec",
      "mjpeg",
      "pipe:1",
    ]);

    // Collect data chunks
    ffmpegProcess.stdout.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });

    // Handle the end of the stream
    ffmpegProcess.stdout.on("end", () => {
      // Split buffer into individual JPEG frames
      const jpegBuffers: Buffer[] = [];
      let offset = 0;

      while (offset < buffer.length) {
        // Find JPEG start and end markers
        const start = buffer.indexOf(Buffer.from([0xff, 0xd8]), offset);
        if (start === -1) break;

        const end = buffer.indexOf(Buffer.from([0xff, 0xd9]), start) + 2;
        if (end === -1) break;

        // Extract and convert each frame to base64
        const frameBuffer = buffer.slice(start, end);
        const base64Frame = `data:image/jpeg;base64,${frameBuffer.toString(
          "base64"
        )}`;
        frames.push(base64Frame);

        offset = end;
      }

      resolve(frames);
    });

    ffmpegProcess.stderr.on("data", (data) => {
      console.log("FFmpeg stderr:", data.toString());
    });

    ffmpegProcess.on("error", (err) => {
      reject(err);
    });

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });
  });
}

async function downloadVideoFetch(url: string, outputPath: string) {
  try {
    // Create output directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const response = await fetch(url);
    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the readable stream from the response
    const stream = fs.createWriteStream(outputPath);
    await pipeline(response.body, stream);

    console.log("Video downloaded successfully");
  } catch (error) {
    console.error("Error downloading video:", error);
    throw error;
  }
}
// Usage example
async function main() {
  try {
    for (const video of videos) {
      const videoPath = `./videos/${video.id}.mp4`;
      await downloadVideoFetch(video.url, videoPath);
      const frames = await extractFramesAsBase64(videoPath);
      for (const frame of frames) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        makeVisionRequest(frame, video.id);
      }
    }
  } catch (error) {
    console.error("Failed to extract frames:", error);
  }
}

main();
type VideoInfo = {
  id: number;
  url: string;
};

async function makeVisionRequest(img: string, videoId: number) {
  try {
    openai.chat.completions
      .create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
                Be as descriptive as you can be. Tell me what you see in this image. Mention everything you can see.

                `,
              },
              {
                type: "image_url",
                image_url: {
                  url: img,
                },
              },
            ],
          },
        ],
        store: false,
      })
      .then((response) => {
        try {
          if (response?.choices?.[0]?.message?.content) {
            console.log(response.choices[0].message.content);
            generateEmbeddingFromText(response.choices[0].message.content).then(
              async (embedding) => {
                if (embedding) {
                  await db.insert(schema.framesEmbeddingsTable).values({
                    videoId: videoId,
                    embedding: embedding,
                  });
                }
              }
            );
          }
        } catch (error) {
          console.error("Error:", error);
        }
      });

    // console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function generateEmbeddingFromText(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      dimensions: 1536,
    });

    if (response.data[0].embedding) {
      return response.data[0].embedding;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
