import * as Decor8Types from "./types";
import { DECOR8_API_KEY } from "../../../../constants/app";

export async function requestImage(
  prompt: string,
  imageUrl: string
): Promise<Decor8Types.GenerationResponse | undefined> {
  try {
    const payload: Decor8Types.GenerationRequest = {
      input_image_url: imageUrl,
      room_type: "livingroom",
      design_style: "minimalist",
      num_images: 1,
      prompt: prompt,
    };

    const response = await fetch(
      "https://api.decor8.ai/generate_designs_for_room",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DECOR8_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const data = (await response.json()) as Decor8Types.GenerationResponse;
      console.log(data);
      return data;
    }
  } catch (err) {
    console.log(err);
  }
}
