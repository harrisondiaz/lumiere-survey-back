import { z } from "zod";

export const surveyAnswersSchema = z.object({
  usedSkincare: z.string().min(1),
  frequency: z.string().min(1),
  budgetRange: z.string().min(1),
  idealProduct: z.string().min(10),
  screenResolution: z.string().optional(),
  timestamp: z.string().optional(),
});

export const surveyBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  ageRange: z.string().min(1),
  country: z.string().min(1),
  answers: surveyAnswersSchema,
  timestamp: z.string(),
  userAgent: z.string(),
  screenResolution: z.string(),
  language: z.string(),
  referrer: z.string(),
  timezone: z.string(),
});

export type SurveyBody = z.infer<typeof surveyBodySchema>;

export const responsesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
