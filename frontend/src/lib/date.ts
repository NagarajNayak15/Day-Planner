export type DateKey = string; // YYYY-MM-DD (UTC)

export function toKey(d: Date): DateKey {
  return d.toISOString().slice(0, 10);
}

export function keyToDate(key: DateKey): Date {
  return new Date(key + 'T00:00:00.000Z');
}

export function todayKey(): DateKey {
  return toKey(new Date());
}

export function addDays(key: DateKey, n: number): DateKey {
  const d = keyToDate(key);
  d.setUTCDate(d.getUTCDate() + n);
  return toKey(d);
}

export function diffDays(a: DateKey, b: DateKey): number {
  const da = keyToDate(a).getTime();
  const db = keyToDate(b).getTime();
  return Math.round((da - db) / 86400000);
}

export function formatLong(key: DateKey): string {
  return keyToDate(key).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShort(key: DateKey): string {
  return keyToDate(key).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatMonthYear(key: DateKey): string {
  return keyToDate(key).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function monthOf(key: DateKey): DateKey {
  return key.slice(0, 7) + '-01';
}

export function startOfDayUTC(d: Date): Date {
  return keyToDate(toKey(d));
}

/** Returns a 6x7 grid of date keys for the month containing `viewKey`. */
export function monthMatrix(viewKey: DateKey): { key: DateKey; inMonth: boolean; isToday: boolean }[] {
  const first = monthOf(viewKey);
  const firstDow = keyToDate(first).getUTCDay(); // 0 = Sun
  const gridStart = addDays(first, -firstDow);
  const t = todayKey();
  const cells: { key: DateKey; inMonth: boolean; isToday: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const key = addDays(gridStart, i);
    cells.push({
      key,
      inMonth: key.slice(0, 7) === viewKey.slice(0, 7),
      isToday: key === t,
    });
  }
  return cells;
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
