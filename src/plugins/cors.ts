import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

export async function registerCors(app: FastifyInstance) {
  const origin = process.env.CORS_ORIGIN || "http://localhost:5173";

  await app.register(cors, {
    origin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
  });
}
