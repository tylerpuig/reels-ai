import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "server", "../../.env") });

export const awsRegion = process.env.AWS_REGION!;
export const s3BucketName = process.env.S3_BUCKET_NAME!;
export const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID!;
export const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
export const decor8ApiKey = process.env.DECOR8_API_KEY!;
export const exampleRoomImage = process.env.EXAMPLE_ROOM_IMAGE!;
