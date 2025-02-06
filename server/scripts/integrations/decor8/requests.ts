import axios from "axios";
import * as decor8Types from "./types.js";
import { uploadImageToS3FromUrl } from "../../../integrations/s3.js";
import { exampleRoomImage, decor8ApiKey } from "../../../scripts/constants.js";

console.log(exampleRoomImage);
async function removeObjectsFromPicture() {
  try {
    const payload: decor8Types.RemoveObjectRequest = {
      input_image_url: exampleRoomImage,
    };
    const { data } = await axios.post<decor8Types.GenerationResponse>(
      "https://api.decor8.ai/remove_objects_from_room",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decor8ApiKey}`,
        },
      }
    );

    console.log(JSON.stringify(data, null, 2));

    const image = data.info.image;
    return image;
  } catch (err) {
    console.log(err);
  }
}
// removeObjectsFromPicture();

async function generateInteriorDesign() {
  try {
    const removedObject = await removeObjectsFromPicture();
    if (!removedObject) {
      throw new Error("Failed to remove objects from image");
    }
    const fileName = `room-${Date.now()}.jpg`;
    const s3Url = await uploadImageToS3FromUrl(removedObject.url, fileName);
    const payload: decor8Types.InteriorGenerationRequest = {
      input_image_url: s3Url,
      room_type: "bedroom",
      design_style: "minimalist",
      num_images: 1,
      prompt: "A bedroom with a large window, fireplace, and a bookshelf.",
    };
    const { data } = await axios.post<decor8Types.GenerationResponse>(
      "https://api.decor8.ai/generate_inspirational_designs",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decor8ApiKey}`,
        },
      }
    );
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.log(err);
  }
}

generateInteriorDesign();
