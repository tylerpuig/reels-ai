import { createTRPCRouter } from "./trpc";
import { greetingRouter } from "./routers/greeting";

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
