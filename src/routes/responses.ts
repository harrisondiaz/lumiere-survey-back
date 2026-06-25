import type { FastifyInstance } from "fastify";
import { requireApiKey } from "../plugins/auth.js";
import { responsesQuerySchema } from "../schemas/survey.js";
import { getSurveyResponses } from "../services/survey.js";

export async function responsesRoutes(app: FastifyInstance) {
  app.get(
    "/responses",
    { preHandler: requireApiKey },
    async (request, reply) => {
      const parsed = responsesQuerySchema.safeParse(request.query);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Validation failed",
          details: parsed.error.flatten(),
        });
      }

      const { page, limit } = parsed.data;

      try {
        const result = await getSurveyResponses(page, limit);
        return reply.status(200).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
