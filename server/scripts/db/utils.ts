import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../db/schema";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

const conn = postgres(process.env.DATABASE_URL!);

export const db = drizzle(conn, { schema });
