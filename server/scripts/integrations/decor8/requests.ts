import axios from "axios";
import * as decor8Types from "./types.js";
import { uploadImageToS3FromUrl } from "../../../integrations/s3.js";
import { decor8ApiKey } from "../../../scripts/constants.js";
import fs from "fs/promises";

async function removeObjectsFromPicture() {
  try {
    const payload: decor8Types.RemoveObjectRequest = {
      input_image_url:
        "https://photos.zillowstatic.com/fp/6410cddcbe1d9692f21c5fb55351460f-uncropped_scaled_within_1536_1152.webp",
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

async function upscaleImage() {
  try {
    const fileContent = await fs.readFile(
      `C:/Users/tphoc/Downloads/ea7c0d43-da22-470e-a203-1088e1966ee6.jpg`
    );
    const payload = {
      input_image: fileContent,
      scale_factor: 2,
    };
    const { data } = await axios.post<decor8Types.GenerationResponse>(
      "https://api.decor8.ai/upscale_image",
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${decor8ApiKey}`,
        },
      }
    );
    console.log(data);
  } catch (err) {
    console.log(err);
  }
}
// upscaleImage();

// generateInteriorDesign();
