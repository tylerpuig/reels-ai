// trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../packages/api-types/index";

export const trpc = createTRPCReact<AppRouter>();
