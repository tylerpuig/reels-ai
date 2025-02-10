import Replicate from "replicate";
import { replicateApiToken } from "../../constants.js";
import axios from "axios";

const replicate = new Replicate({
  auth: replicateApiToken,
});

async function run() {
  try {
    const input = {
      prompt:
        "Make a video that pans around a house and starts with this image",
      start_image_url:
        "https://photos.zillowstatic.com/fp/9a8a6422699e779e005b63c45523cc66-cc_ft_768.webp",
    };
    console.time("generate");
    const output = await replicate.run("luma/ray", { input });
    console.timeEnd("generate");
    console.log(output);
  } catch (err) {
    console.log(err);
  }
}

async function makeRequest() {
  try {
    const { data } = await axios({
      method: "post",
      url: "https://api.replicate.com/v1/models/luma/ray/predictions",
      headers: {
        Authorization: `Bearer ${replicateApiToken}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      data: {
        input: {
          prompt:
            "Make a video that pans around a house and starts with this image",
          start_image_url:
            "https://photos.zillowstatic.com/fp/a50e286e978e77a44d88385f3d1147db-cc_ft_384.webp",
        },
      },
    });

    console.log(data);
  } catch (err) {
    console.log(err);
  }
}
makeRequest();
