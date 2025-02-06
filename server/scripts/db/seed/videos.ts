import { db } from "../utils.js";
import * as schema from "../../../db/schema.js";
import fs from "fs/promises";
import * as DBTypes from "../../../db/types.js";
import { generateListing } from "./helpers.js";

const demoUsers: DBTypes.UserInsertion[] = [
  {
    id: "57bb749c-a176-4e73-bf24-980e1f5ec1c2",
    name: "Sarah",
    email: "sarah@remax.com",
    avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "b9e1e276-519d-4706-914f-6f4e457d650d",
    name: "Zach",
    email: "zach@leadingrealty.com",
    avatarUrl: "https://randomuser.me/api/portraits/men/4.jpg",
  },
];

const demoImages = [
  [
    "https://photos.zillowstatic.com/fp/e7acc1a21b38852c901a9451bdd734ce-cc_ft_768.webp",
    "https://photos.zillowstatic.com/fp/b54b6fad7478672ba4d6e44701bf8980-uncropped_scaled_within_1536_1152.webp",
    "https://photos.zillowstatic.com/fp/5dc3d1d8869682af63b3acecdd70417a-uncropped_scaled_within_1536_1152.webp",
    "https://photos.zillowstatic.com/fp/396d4ec2fbdcd415625e84cdea4547cd-uncropped_scaled_within_1536_1152.webp",
  ],
  [
    "https://photos.zillowstatic.com/fp/9a8a6422699e779e005b63c45523cc66-cc_ft_768.webp",
    "https://photos.zillowstatic.com/fp/a7a598a37b279dcdcac15a26d4abe9f9-cc_ft_768.webp",
    "https://photos.zillowstatic.com/fp/3b67177ffd4a4ecfee004b471f63638f-cc_ft_384.webp",
    "https://photos.zillowstatic.com/fp/a50e286e978e77a44d88385f3d1147db-cc_ft_384.webp",
  ],
  [
    "https://photos.zillowstatic.com/fp/c5e17a8657f81a9ee4f0f0257ec60e4f-cc_ft_768.webp",
    "https://photos.zillowstatic.com/fp/8f3b6ca6b446ebc5ab97b1270d0fd598-cc_ft_384.webp",
    "https://photos.zillowstatic.com/fp/2c43f0007307aed42c858654d489bfc0-cc_ft_768.webp",
    "https://photos.zillowstatic.com/fp/5d4aa0d60fe98ed7fca304576965dc5a-cc_ft_384.webp",
  ],
];

async function seedDB() {
  try {
    for (const user of demoUsers) {
      await db.insert(schema.usersTable).values(user);
    }

    const randInt = Math.floor(Math.random() * demoUsers.length);
    const seedUserId = demoUsers[randInt].id;
    const parsed = JSON.parse(
      await fs.readFile("../videos.json", "utf-8")
    ) as DBTypes.VideoInsertion[];

    let imgIndexCounter = 0;
    for (const video of parsed) {
      const listing = generateListing(seedUserId, video.title);

      // insert listing
      const [newListing] = await db
        .insert(schema.listingsTable)
        .values(listing)
        .returning();

      const images = demoImages[imgIndexCounter];
      for (const image of images) {
        await db.insert(schema.listingImagesTable).values({
          listingId: newListing.id,
          url: image,
        });
      }

      // insert video
      video.userId = seedUserId;
      video.listingId = newListing.id;
      await db.insert(schema.videosTable).values(video);
      imgIndexCounter++;
    }
  } catch (err) {
    console.log(err);
  }
}
seedDB();
