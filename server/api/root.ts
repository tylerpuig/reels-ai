import { createTRPCRouter } from "./trpc.js";
import { greetingRouter } from "./routers/greeting.js";
import { videosRouter } from "./routers/videos.js";
import { userRouter } from "./routers/user.js";
import { listingsRouter } from "./routers/listings.js";
import { chatRouter } from "./routers/chat.js";
import { adsRouter } from "./routers/ads.js";

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  videos: videosRouter,
  user: userRouter,
  listings: listingsRouter,
  chat: chatRouter,
  ads: adsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
