/**
 * Date helpers. All streak/completion logic uses a UTC-based day key in
 * the form YYYY-MM-DD so that "today" is consistent across the server.
 */

export function toDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(dateKey: string, days: number): string {
  const d = new Date(dateKey + 'T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function diffInDays(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00.000Z').getTime();
  const db = new Date(b + 'T00:00:00.000Z').getTime();
  return Math.round((da - db) / (24 * 60 * 60 * 1000));
}

export function startOfMonth(dateKey: string): string {
  return dateKey.slice(0, 7) + '-01';
}

export function daysInMonth(dateKey: string): number {
  const [y, m] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function prettyDate(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00.000Z');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function isWeekend(dateKey: string): boolean {
  const d = new Date(dateKey + 'T00:00:00.000Z').getUTCDay();
  return d === 0 || d === 6;
}
