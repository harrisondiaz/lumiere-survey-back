import { describe, it, expect } from "vitest";
import {
  surveyBodySchema,
  responsesQuerySchema,
} from "../src/schemas/survey.js";

const validPayload = {
  name: "Jane Doe",
  email: "jane@example.com",
  ageRange: "25-34",
  country: "ES",
  answers: {
    usedSkincare: "yes",
    frequency: "daily",
    budgetRange: "50-100",
    idealProduct: "A lightweight serum with vitamin C",
  },
  timestamp: "2025-06-24T12:00:00.000Z",
  userAgent: "TestAgent/1.0",
  screenResolution: "1920x1080",
  language: "es-ES",
  referrer: "",
  timezone: "Europe/Madrid",
};

describe("surveyBodySchema", () => {
  it("accepts a valid survey payload", () => {
    const result = surveyBodySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = surveyBodySchema.safeParse({
      ...validPayload,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short idealProduct", () => {
    const result = surveyBodySchema.safeParse({
      ...validPayload,
      answers: { ...validPayload.answers, idealProduct: "short" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = surveyBodySchema.safeParse({
      ...validPayload,
      name: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("responsesQuerySchema", () => {
  it("applies defaults", () => {
    const result = responsesQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("coerces string numbers", () => {
    const result = responsesQuerySchema.parse({ page: "2", limit: "10" });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it("rejects limit over 100", () => {
    const result = responsesQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });
});
