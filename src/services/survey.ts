import type { SurveyResponse } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { SurveyBody } from "../schemas/survey.js";

export async function createSurveyResponse(
  data: SurveyBody,
  ip: string
): Promise<SurveyResponse> {
  const { answers, timestamp, screenResolution, ...rest } = data;

  const enrichedAnswers = {
    ...answers,
    timestamp,
    screenResolution,
  };

  return prisma.surveyResponse.create({
    data: {
      name: rest.name,
      email: rest.email,
      ageRange: rest.ageRange,
      country: rest.country,
      answers: enrichedAnswers,
      ip,
      userAgent: rest.userAgent,
      timezone: rest.timezone,
      language: rest.language,
      referrer: rest.referrer || "direct",
    },
  });
}

export async function getSurveyResponses(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.surveyResponse.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.surveyResponse.count(),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getSurveyResponsesByDateRange(
  from: Date,
  to: Date,
  limit = 20
) {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  const [data, total] = await Promise.all([
    prisma.surveyResponse.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.surveyResponse.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    }),
  ]);

  return { data, total, from: start, to: end };
}

export async function getTodaySurveyResponses(limit = 20) {
  const today = new Date();
  return getSurveyResponsesByDateRange(today, today, limit);
}
