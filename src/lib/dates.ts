export function parseLocalDate(
  dateString: string,
  options?: { endOfDay?: boolean }
): Date {
  const [yearStr, monthStr, dayStr] = dateString.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const day = Number(dayStr);

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) {
    return new Date(dateString);
  }

  if (options?.endOfDay) return new Date(year, monthIndex, day, 23, 59, 59, 999);
  return new Date(year, monthIndex, day, 0, 0, 0, 0);
}

export function parseDateLike(dateLike: Date | string): Date {
  if (dateLike instanceof Date) return dateLike;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateLike)) return parseLocalDate(dateLike);
  return new Date(dateLike);
}

export function formatDateInputValue(dateLike: Date | string): string {
  const date = parseDateLike(dateLike);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateInputValueInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value ?? String(date.getFullYear());
  const month = parts.find((p) => p.type === "month")?.value ?? String(date.getMonth() + 1).padStart(2, "0");
  const day = parts.find((p) => p.type === "day")?.value ?? String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTimeInputValueInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")?.value ?? String(date.getHours()).padStart(2, "0");
  const minute = parts.find((p) => p.type === "minute")?.value ?? String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}
