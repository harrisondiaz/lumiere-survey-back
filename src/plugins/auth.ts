import type { FastifyReply, FastifyRequest } from "fastify";

export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers["x-api-key"];
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return reply.status(500).send({ error: "API key not configured" });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}
