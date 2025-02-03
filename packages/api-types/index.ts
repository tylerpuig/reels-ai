// packages/api-types/index.ts
// import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../server/api/root"; // Only importing the type

// Export only types, no actual implementation
export type { AppRouter };
// export type RouterInputs = inferRouterInputs<AppRouter>;
// export type RouterOutputs = inferRouterOutputs<AppRouter>;
