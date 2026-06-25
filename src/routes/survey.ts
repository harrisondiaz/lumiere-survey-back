import type { FastifyInstance } from "fastify";
import { surveyBodySchema } from "../schemas/survey.js";
import { extractIp } from "../lib/ip.js";
import { createSurveyResponse } from "../services/survey.js";
import { sendSurveyNotification } from "../services/telegram.js";

export async function surveyRoutes(app: FastifyInstance) {
  app.post("/survey", async (request, reply) => {
    const parsed = surveyBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const ip = extractIp(request);

    try {
      const response = await createSurveyResponse(parsed.data, ip);
      await sendSurveyNotification(response);
      return reply.status(200).send({ success: true, id: response.id });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
