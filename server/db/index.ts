import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import dotenv from "dotenv";
dotenv.config({
  path: process.cwd() + "/.env",
});

if (!process.env?.DATABASE_URL) {
  console.log("DATABASE_URL not found", process.env.DATABASE_URL);
}
const conn = postgres(process.env.DATABASE_URL!);

export const db = drizzle(conn, { schema });
