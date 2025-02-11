import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { databaseUrl } from "../scripts/constants.js";
// import dotenv from "dotenv";
// dotenv.config({
//   path: process.cwd() + "/.env",
// });

if (!databaseUrl) {
  console.log("DATABASE_URL not found", databaseUrl);
}
const conn = postgres(databaseUrl);

export const db = drizzle(conn, { schema });
