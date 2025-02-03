import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./api/root";
import { createTRPCContext } from "./api/trpc";
import cors from "express";

const app = express();
app.use(cors());
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => {
      // Convert Express headers to Headers object
      const headers = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
      });

      return createTRPCContext({ headers });
    },
  })
);

app.listen(4130, "0.0.0.0", () => {
  console.log("tRPC server running at http://localhost:4130/trpc");
});
