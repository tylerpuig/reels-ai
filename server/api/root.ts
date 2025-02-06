import { createTRPCRouter } from "./trpc.js";
import { greetingRouter } from "./routers/greeting.js";
import { videosRouter } from "./routers/videos.js";
import { userRouter } from "./routers/user.js";
import { listingsRouter } from "./routers/listings.js";

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  videos: videosRouter,
  user: userRouter,
  listings: listingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
