import TelegramBot from "node-telegram-bot-api";
import type { SurveyResponse } from "@prisma/client";
import {
  escapeMarkdown,
  formatDateOnly,
  formatTimestamp,
  parseDate,
  shortenUserAgent,
} from "../lib/telegram-utils.js";
import {
  getSurveyResponsesByDateRange,
  getTodaySurveyResponses,
} from "./survey.js";

let bot: TelegramBot | null = null;

type SessionState =
  | { step: "idle" }
  | { step: "awaiting_from" }
  | { step: "awaiting_to"; from: Date };

const sessions = new Map<number, SessionState>();

function getAuthorizedChatId(): string | undefined {
  return process.env.TELEGRAM_CHAT_ID;
}

function isAuthorized(chatId: number): boolean {
  const authorized = getAuthorizedChatId();
  if (!authorized) return false;
  return String(chatId) === authorized;
}

function getBot(): TelegramBot | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  if (!bot) {
    bot = new TelegramBot(token, { polling: true });
  }
  return bot;
}

function formatResponseSummary(response: SurveyResponse): string {
  return [
    `• *${escapeMarkdown(response.name)}* — ${escapeMarkdown(response.email)}`,
    `  🌍 ${escapeMarkdown(response.country)} · 🕐 ${escapeMarkdown(formatTimestamp(response.createdAt))}`,
  ].join("\n");
}

function formatSearchResults(
  data: SurveyResponse[],
  total: number,
  from: Date,
  to: Date
): string {
  const header = [
    "📊 *Resultados de búsqueda*",
    `📅 Desde: ${escapeMarkdown(formatDateOnly(from))}`,
    `📅 Hasta: ${escapeMarkdown(formatDateOnly(to))}`,
    `📝 Total: ${total} respuesta${total === 1 ? "" : "s"}`,
    "",
  ].join("\n");

  if (data.length === 0) {
    return `${header}No hay respuestas en ese rango de fechas.`;
  }

  const items = data.map(formatResponseSummary).join("\n");
  const footer =
    total > data.length
      ? `\n\n_Mostrando ${data.length} de ${total}. Usa la API para ver más._`
      : "";

  return `${header}${items}${footer}`;
}

function getHelpMessage(): string {
  return [
    "👋 *Bot Lumière Survey*",
    "",
    "Comandos disponibles:",
    "/hoy — Respuestas de hoy",
    "/buscar — Buscar por rango de fechas",
    "/cancelar — Cancelar búsqueda en curso",
    "/ayuda — Ver este mensaje",
    "",
    "También puedes escribir directamente:",
    "`/buscar 2025-01-01 2025-06-30`",
    "",
    "Formatos de fecha: `YYYY-MM-DD` o `DD/MM/YYYY`",
  ].join("\n");
}

async function handleSearch(chatId: number, from: Date, to: Date) {
  const telegramBot = getBot();
  if (!telegramBot) return;

  if (from > to) {
    await telegramBot.sendMessage(
      chatId,
      "⚠️ La fecha de inicio no puede ser posterior a la fecha final."
    );
    return;
  }

  const result = await getSurveyResponsesByDateRange(from, to);
  await telegramBot.sendMessage(
    chatId,
    formatSearchResults(result.data, result.total, result.from, result.to),
    { parse_mode: "Markdown" }
  );
}

export function initTelegramBot(): void {
  const telegramBot = getBot();
  const authorizedChatId = getAuthorizedChatId();

  if (!telegramBot) {
    console.warn("TELEGRAM_BOT_TOKEN not set — bot disabled");
    return;
  }

  if (!authorizedChatId) {
    console.warn("TELEGRAM_CHAT_ID not set — bot commands disabled");
    return;
  }

  console.log("Telegram bot listening for commands...");

  telegramBot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim() ?? "";

    if (!isAuthorized(chatId)) {
      await telegramBot.sendMessage(
        chatId,
        "⛔ No tienes permiso para usar este bot."
      );
      return;
    }

    const session = sessions.get(chatId) ?? { step: "idle" };

    if (text === "/cancelar") {
      sessions.set(chatId, { step: "idle" });
      await telegramBot.sendMessage(chatId, "❌ Búsqueda cancelada.");
      return;
    }

    if (text === "/start" || text === "/ayuda") {
      sessions.set(chatId, { step: "idle" });
      await telegramBot.sendMessage(chatId, getHelpMessage(), {
        parse_mode: "Markdown",
      });
      return;
    }

    if (text === "/hoy") {
      sessions.set(chatId, { step: "idle" });
      const result = await getTodaySurveyResponses();
      await telegramBot.sendMessage(
        chatId,
        formatSearchResults(result.data, result.total, result.from, result.to),
        { parse_mode: "Markdown" }
      );
      return;
    }

    const directSearch = text.match(/^\/buscar(?:@\w+)?(?:\s+(\S+)\s+(\S+))?$/);
    if (directSearch) {
      sessions.set(chatId, { step: "idle" });

      if (directSearch[1] && directSearch[2]) {
        const from = parseDate(directSearch[1]);
        const to = parseDate(directSearch[2]);

        if (!from || !to) {
          await telegramBot.sendMessage(
            chatId,
            "⚠️ Formato inválido. Usa: `/buscar 2025-01-01 2025-06-30`",
            { parse_mode: "Markdown" }
          );
          return;
        }

        await handleSearch(chatId, from, to);
        return;
      }

      sessions.set(chatId, { step: "awaiting_from" });
      await telegramBot.sendMessage(
        chatId,
        "📅 *Búsqueda por fechas*\n\n¿Desde qué fecha?\n\nFormato: `YYYY-MM-DD` o `DD/MM/YYYY`",
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (session.step === "awaiting_from") {
      const from = parseDate(text);
      if (!from) {
        await telegramBot.sendMessage(
          chatId,
          "⚠️ Fecha no válida. Ejemplo: `2025-06-01` o `01/06/2025`",
          { parse_mode: "Markdown" }
        );
        return;
      }

      sessions.set(chatId, { step: "awaiting_to", from });
      await telegramBot.sendMessage(
        chatId,
        `✅ Desde: *${escapeMarkdown(formatDateOnly(from))}*\n\n¿Hasta qué fecha?`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (session.step === "awaiting_to") {
      const to = parseDate(text);
      if (!to) {
        await telegramBot.sendMessage(
          chatId,
          "⚠️ Fecha no válida. Ejemplo: `2025-06-30` o `30/06/2025`",
          { parse_mode: "Markdown" }
        );
        return;
      }

      sessions.set(chatId, { step: "idle" });
      await handleSearch(chatId, session.from, to);
      return;
    }

    if (text.startsWith("/")) {
      await telegramBot.sendMessage(
        chatId,
        "Comando no reconocido. Escribe /ayuda para ver opciones."
      );
    }
  });

  telegramBot.on("polling_error", (error) => {
    console.error("Telegram polling error:", error.message);
  });
}

export async function sendSurveyNotification(
  response: SurveyResponse
): Promise<void> {
  const telegramBot = getBot();
  const chatId = getAuthorizedChatId();

  if (!telegramBot || !chatId) {
    console.warn("Telegram not configured, skipping notification");
    return;
  }

  const message = [
    "🔔 *Nueva respuesta recibida*",
    `👤 Nombre: ${escapeMarkdown(response.name)}`,
    `📧 Email: ${escapeMarkdown(response.email)}`,
    `🌍 País: ${escapeMarkdown(response.country)}`,
    `🕐 Hora: ${escapeMarkdown(formatTimestamp(response.createdAt))}`,
    `🌐 IP: ${escapeMarkdown(response.ip)}`,
    `📱 Dispositivo: ${escapeMarkdown(shortenUserAgent(response.userAgent))}`,
    `🗺️ Timezone: ${escapeMarkdown(response.timezone)}`,
    `🔗 Referrer: ${escapeMarkdown(response.referrer || "direct")}`,
    "",
    "_Usa /hoy o /buscar para consultar respuestas_",
  ].join("\n");

  try {
    await telegramBot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

export async function stopTelegramBot(): Promise<void> {
  if (bot) {
    await bot.stopPolling();
    bot = null;
  }
}
