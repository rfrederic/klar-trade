// Isomorphic timezone helpers (safe on client and server — Intl is available
// in both). All trade/session timestamps are stored in UTC; these helpers
// convert between UTC instants and a user's local IANA timezone so that
// "today", "this month", and per-day/per-hour aggregates line up with what
// the user actually sees on their calendar, not the server's clock.

export const DEFAULT_TIMEZONE = "UTC";

export function isValidTimeZone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// The browser's current IANA timezone (e.g. "America/New_York"). Only
// meaningful on the client — falls back to UTC if Intl is unavailable.
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

// Picks the effective timezone for a request: an explicit override (e.g. a
// live browser-detected value sent by the client) wins if valid, otherwise
// the user's saved preference, otherwise UTC.
export function resolveTimezone(
  explicit: string | null | undefined,
  stored: string | null | undefined
): string {
  if (isValidTimeZone(explicit)) return explicit;
  if (isValidTimeZone(stored)) return stored;
  return DEFAULT_TIMEZONE;
}

interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number; // 0 = Sunday .. 6 = Saturday
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

// Breaks a UTC instant down into its wall-clock components as seen in `timeZone`.
export function getZonedParts(date: Date | string, timeZone: string): ZonedParts {
  const d = typeof date === "string" ? new Date(date) : date;
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, weekday: "short",
  });
  const map: Record<string, string> = {};
  for (const part of dtf.formatToParts(d)) map[part.type] = part.value;
  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0; // some locales render midnight as "24"
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour,
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
    dayOfWeek: WEEKDAY_INDEX[map.weekday] ?? d.getUTCDay(),
  };
}

// "YYYY-MM-DD" calendar date of `date` as seen in `timeZone`.
export function getLocalDateString(date: Date | string, timeZone: string): string {
  const { year, month, day } = getZonedParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Offset (in minutes) of `timeZone` from UTC at the instant `utcDate`.
function getOffsetMinutes(utcDate: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const part of dtf.formatToParts(utcDate)) map[part.type] = part.value;
  const asUtc = Date.UTC(
    Number(map.year), Number(map.month) - 1, Number(map.day),
    Number(map.hour), Number(map.minute), Number(map.second)
  );
  return (asUtc - utcDate.getTime()) / 60000;
}

// Converts a local wall-clock time in `timeZone` to the equivalent UTC Date.
// `day`/`month` may overflow (e.g. day 32) — Date.UTC normalises it, same as
// the native Date constructor, so callers can do "day + 1" style arithmetic.
export function zonedTimeToUtc(
  year: number, month: number, day: number,
  hour: number, minute: number, second: number,
  timeZone: string
): Date {
  let guess = Date.UTC(year, month - 1, day, hour, minute, second);
  // Two passes converge even across DST transitions.
  for (let i = 0; i < 2; i++) {
    const offset = getOffsetMinutes(new Date(guess), timeZone);
    guess = Date.UTC(year, month - 1, day, hour, minute, second) - offset * 60000;
  }
  return new Date(guess);
}

// [start, end) in UTC for the local calendar day `dateStr` ("YYYY-MM-DD") —
// `end` is the start of the next local day, an exclusive upper bound.
export function localDayRangeUtc(dateStr: string, timeZone: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map(Number);
  return {
    start: zonedTimeToUtc(y, m, d, 0, 0, 0, timeZone),
    end: zonedTimeToUtc(y, m, d + 1, 0, 0, 0, timeZone),
  };
}

// [start, end) in UTC for the local calendar month — `monthIndex0` is
// 0-indexed like JS Date (0 = January), matching the rest of the app.
// `end` is the start of the next local month, an exclusive upper bound.
export function localMonthRangeUtc(
  year: number, monthIndex0: number, timeZone: string
): { start: Date; end: Date } {
  return {
    start: zonedTimeToUtc(year, monthIndex0 + 1, 1, 0, 0, 0, timeZone),
    end: zonedTimeToUtc(year, monthIndex0 + 2, 1, 0, 0, 0, timeZone),
  };
}

// Start of "today" in `timeZone`, as a UTC Date — for rolling "today" boundaries.
export function startOfLocalDayUtc(timeZone: string, at: Date = new Date()): Date {
  const { year, month, day } = getZonedParts(at, timeZone);
  return zonedTimeToUtc(year, month, day, 0, 0, 0, timeZone);
}

// Start of the local calendar year in `timeZone`, as a UTC Date — for YTD ranges.
export function startOfLocalYearUtc(timeZone: string, at: Date = new Date()): Date {
  const { year } = getZonedParts(at, timeZone);
  return zonedTimeToUtc(year, 1, 1, 0, 0, 0, timeZone);
}

// "YYYY-MM-DD" for the local calendar day `daysAgo` days before `at` (or now)
// in `timeZone`. `daysAgo = 0` is today. Used to walk back N local calendar
// days for streaks/calendars without drifting across DST transitions.
export function localDateStringDaysAgo(
  daysAgo: number, timeZone: string, at: Date = new Date()
): string {
  const { year, month, day } = getZonedParts(at, timeZone);
  const d = zonedTimeToUtc(year, month, day - daysAgo, 0, 0, 0, timeZone);
  return getLocalDateString(d, timeZone);
}
