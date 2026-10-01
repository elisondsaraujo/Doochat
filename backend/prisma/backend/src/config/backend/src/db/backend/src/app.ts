import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import conversationRoutes from "./routes/conversations.routes.js";
import messageRoutes from "./routes/messages.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(
  helmet()
);

app.use(
  cors({
    origin: env.CORS_ORIGIN === "*"
      ? true
      : env.CORS_ORIGIN
  })
);

app.use(express.json({
  limit: "1mb"
}));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "doochat-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);

export default app;
