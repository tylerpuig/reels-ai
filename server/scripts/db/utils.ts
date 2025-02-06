import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../db/schema.js";
import { databaseUrl } from "../constants.js";

const conn = postgres(databaseUrl);

export const db = drizzle(conn, { schema });
