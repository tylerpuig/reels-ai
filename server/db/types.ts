import * as schema from "../db/schema.js";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type ListingInfo = InferSelectModel<typeof schema.listingsTable>;
export type ListingInsertion = InferInsertModel<typeof schema.listingsTable>;
export type UserInsertion = InferInsertModel<typeof schema.usersTable>;
export type VideoInsertion = InferInsertModel<typeof schema.videosTable>;
