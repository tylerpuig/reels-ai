import { db } from "../utils.js";
import * as schema from "../../../db/schema.js";
import {
  uploadVideoToS3,
  insertVideo,
  type VideoInfo,
} from "../../s3/uploadVideos.js";

async function main() {
  // for (const video of newVideos) {
  // const s3Url = await uploadVideoToS3(video.path);
  // const videoInfo: VideoInfo = {
  //   title: video.title,
  //   description: video.description,
  //   path: video.path,
  // };
  // await insertVideo(videoInfo, s3Url);
  // }
}
main();
