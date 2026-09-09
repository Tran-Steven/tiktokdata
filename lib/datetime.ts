export type TimezoneId =
  | "system"
  | "America/Los_Angeles"
  | "America/New_York"
  | "UTC";

export const TIMEZONE_OPTIONS: { id: TimezoneId; label: string }[] = [
  { id: "system", label: "Device (Local)" },
  { id: "America/Los_Angeles", label: "Pacific Time" },
  { id: "America/New_York", label: "Eastern Time" },
  { id: "UTC", label: "UTC" },
];

// TikTok exports dates as "YYYY-MM-DD HH:mm:ss" with no zone marker, always in UTC.
export function parseUtc(raw: string): Date {
  const trimmed = (raw || "").trim();
  if (!trimmed) return new Date(Number.NaN);
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed)) return new Date(trimmed);
  const isoLike = trimmed.includes(" ") ? trimmed.replace(" ", "T") : trimmed;
  const withZone = isoLike.includes("T") ? `${isoLike}Z` : isoLike;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? new Date(trimmed) : date;
}

function resolveTimeZone(tz: TimezoneId): string | undefined {
  return tz === "system" ? undefined : tz;
}

export function getDayKey(raw: string, tz: TimezoneId): string {
  const date = parseUtc(raw);
  if (Number.isNaN(date.getTime())) return "invalid";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: resolveTimeZone(tz),
  }).format(date);
}

export function formatTimestamp(
  raw: string,
  tz: TimezoneId,
  variant: "short" | "divider" = "short",
): string {
  const date = parseUtc(raw);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const timeZone = resolveTimeZone(tz);

  if (variant === "short") {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(date);
  }

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(date);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dateKey = getDayKey(raw, tz);
  if (dateKey === getDayKey(now.toISOString(), tz)) return `Today ${timePart}`;
  if (dateKey === getDayKey(yesterday.toISOString(), tz))
    return `Yesterday ${timePart}`;

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone,
  }).format(date);
  return `${datePart}, ${timePart}`;
}
