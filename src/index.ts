import "dotenv/config";
import { buildApp } from "./app.js";
import { initTelegramBot, stopTelegramBot } from "./services/telegram.js";
import { prisma } from "./lib/prisma.js";

async function start() {
  initTelegramBot();

  const app = await buildApp({ logger: true });
  const port = Number(process.env.PORT) || 3000;

  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const shutdown = async () => {
    await stopTelegramBot();
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
