/** Escape dynamic text for Telegram legacy Markdown (not MarkdownV2). */
export function escapeMarkdown(text: string): string {
  return text.replace(/([_*[`\[])/g, "\\$1");
}

export function parseDate(input: string): Date | null {
  const trimmed = input.trim();

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const isoMatch = trimmed.match(iso);
  if (isoMatch) {
    const date = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const dmyMatch = trimmed.match(dmy);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const date = new Date(`${dmyMatch[3]}-${month}-${day}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function shortenUserAgent(userAgent: string, maxLength = 80): string {
  if (userAgent.length <= maxLength) return userAgent;
  return `${userAgent.slice(0, maxLength - 3)}...`;
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export function formatDateOnly(date: Date): string {
  return date.toLocaleDateString("es-ES");
}
