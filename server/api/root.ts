import { createTRPCRouter } from "./trpc.js";
import { greetingRouter } from "./routers/greeting.js";
import { videosRouter } from "./routers/videos.js";

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  videos: videosRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
