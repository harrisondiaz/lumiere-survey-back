import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

vi.mock("../src/services/telegram.js", () => ({
  sendSurveyNotification: vi.fn().mockResolvedValue(undefined),
  initTelegramBot: vi.fn(),
  stopTelegramBot: vi.fn(),
}));

const validPayload = {
  name: "Test User",
  email: "test@example.com",
  ageRange: "25-34",
  country: "ES",
  answers: {
    usedSkincare: "yes",
    frequency: "daily",
    budgetRange: "50-100",
    idealProduct: "A lightweight serum with natural ingredients",
  },
  timestamp: new Date().toISOString(),
  userAgent: "Vitest/1.0",
  screenResolution: "1920x1080",
  language: "es-ES",
  referrer: "",
  timezone: "Europe/Madrid",
};

describe("API integration", () => {
  beforeEach(async () => {
    await prisma.surveyResponse.deleteMany();
  });

  it("GET /health returns ok", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    await app.close();
  });

  it("POST /api/survey saves a response", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/survey",
      headers: { "content-type": "application/json" },
      payload: validPayload,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ success: true, id: expect.any(Number) });

    const count = await prisma.surveyResponse.count();
    expect(count).toBe(1);
    await app.close();
  });

  it("POST /api/survey rejects invalid body", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/survey",
      headers: { "content-type": "application/json" },
      payload: { name: "x" },
    });

    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it("GET /api/responses requires API key", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/api/responses",
    });

    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("GET /api/responses returns paginated data with valid key", async () => {
    const app = await buildApp();

    await app.inject({
      method: "POST",
      url: "/api/survey",
      headers: { "content-type": "application/json" },
      payload: validPayload,
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/responses?page=1&limit=10",
      headers: { "x-api-key": "test-api-key" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.total).toBe(1);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].email).toBe("test@example.com");
    await app.close();
  });

  it("extracts IP from x-forwarded-for header", async () => {
    const app = await buildApp();
    await app.inject({
      method: "POST",
      url: "/api/survey",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.50",
      },
      payload: validPayload,
    });

    const saved = await prisma.surveyResponse.findFirst();
    expect(saved?.ip).toBe("203.0.113.50");
    await app.close();
  });
});
