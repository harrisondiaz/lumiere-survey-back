import { describe, it, expect } from "vitest";
import {
  parseDate,
  escapeMarkdown,
  shortenUserAgent,
} from "../src/lib/telegram-utils.js";
import { extractIp } from "../src/lib/ip.js";

describe("parseDate", () => {
  it("parses ISO format YYYY-MM-DD", () => {
    const date = parseDate("2025-06-24");
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2025);
    expect(date!.getMonth()).toBe(5);
    expect(date!.getDate()).toBe(24);
  });

  it("parses DD/MM/YYYY format", () => {
    const date = parseDate("24/06/2025");
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2025);
  });

  it("returns null for invalid input", () => {
    expect(parseDate("invalid")).toBeNull();
    expect(parseDate("")).toBeNull();
  });
});

describe("escapeMarkdown", () => {
  it("escapes special characters", () => {
    expect(escapeMarkdown("hello_world")).toBe("hello\\_world");
    expect(escapeMarkdown("test.name")).toBe("test\\.name");
  });
});

describe("shortenUserAgent", () => {
  it("returns short strings unchanged", () => {
    expect(shortenUserAgent("Mozilla/5.0")).toBe("Mozilla/5.0");
  });

  it("truncates long strings", () => {
    const long = "A".repeat(100);
    const result = shortenUserAgent(long);
    expect(result.length).toBeLessThanOrEqual(80);
    expect(result.endsWith("...")).toBe(true);
  });
});

describe("extractIp", () => {
  it("uses x-forwarded-for first IP", () => {
    const ip = extractIp({
      ip: "127.0.0.1",
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    } as never);
    expect(ip).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const ip = extractIp({
      ip: "127.0.0.1",
      headers: { "x-real-ip": "198.51.100.1" },
    } as never);
    expect(ip).toBe("198.51.100.1");
  });

  it("falls back to request.ip", () => {
    const ip = extractIp({
      ip: "127.0.0.1",
      headers: {},
    } as never);
    expect(ip).toBe("127.0.0.1");
  });
});
