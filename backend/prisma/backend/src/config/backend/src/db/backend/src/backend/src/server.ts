import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";

const server = app.listen(env.PORT, () => {
  console.log(
    `Doochat API running on http://localhost:${env.PORT}`
  );
});

async function shutdown() {
  console.log("Shutting down Doochat API...");

  await prisma.$disconnect();

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
