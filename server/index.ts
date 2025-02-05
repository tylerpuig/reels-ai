import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./api/root.js";
import { createTRPCContext } from "./api/trpc.js";
import cors from "cors";
import * as schema from "./db/schema.js";
import { db } from "./db/index.js";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*", // Be more specific in production
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

type NewUserRequest = {
  userId: string;
  name: string;
  email: string;
};
app.post("/newUser", async (req, res) => {
  const { userId, name, email } = req.body as NewUserRequest;
  console.log(req.body);

  // Basic validation
  if (!userId || !name || !email) {
    return res.status(400).json({
      error: "Missing required fields. Please provide userId, name, and email.",
    });
  }

  await db.insert(schema.usersTable).values([
    {
      id: userId,
      name: name,
      email: email,
      avatarUrl: faker.image.avatar(),
    },
  ]);

  res.status(201).json({
    message: "User data received successfully",
    user: {
      userId,
      name,
      email,
    },
  });
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

app.listen(3003, "0.0.0.0", () => {
  console.log("tRPC server running at http://localhost:3003/trpc");
});
