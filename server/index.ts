import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./api/root.js";
import { createTRPCContext } from "./api/trpc.js";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "*", // Be more specific in production
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add a simple test endpoint
app.get("/health", (req, res) => {
  // console.log(req);
  res.json({ status: "ok" });
});

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

app.listen(3000, "0.0.0.0", () => {
  console.log("tRPC server running at http://localhost:4130/trpc");
});
