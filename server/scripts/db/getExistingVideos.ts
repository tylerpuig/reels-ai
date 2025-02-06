import { db } from "../db/utils.js";
import * as schema from "../../db/schema.js";
import fs from "fs/promises";

async function main() {
  try {
    const videos = await db.select().from(schema.videosTable);
    // const str = JSON.stringify(videos, null, 2);
    const allData = [];
    for (const video of videos) {
      allData.push({
        video: video,
        images: [],
      });
    }

    // await fs.writeFile("videos.json", str);
  } catch (err) {
    console.log(err);
  }
}
main();
