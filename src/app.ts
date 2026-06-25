import type { FastifyInstance } from "fastify";
import Fastify from "fastify";
import { registerCors } from "./plugins/cors.js";
import { surveyRoutes } from "./routes/survey.js";
import { responsesRoutes } from "./routes/responses.js";

export async function buildApp(options?: {
  logger?: boolean;
}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options?.logger ?? false,
    trustProxy: true,
  });

  await registerCors(app);

  await app.register(
    async (api) => {
      await api.register(surveyRoutes);
      await api.register(responsesRoutes);
    },
    { prefix: "/api" }
  );

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
