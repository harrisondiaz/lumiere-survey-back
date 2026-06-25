import { beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";

beforeAll(() => {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: "file:./prisma/test.db",
    },
  });
});

afterAll(async () => {
  const { prisma } = await import("../src/lib/prisma.js");
  await prisma.$disconnect();
});
