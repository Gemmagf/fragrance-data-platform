/** Number formatting for the dashboard. Locale is fixed to en-GB so server and client render identically. */

export function chfMillions(v: number, digits = 1): string {
  return `CHF ${(v / 1e6).toFixed(digits)}M`;
}

export function pct(v: number | null | undefined, digits = 1): string {
  return v == null ? "—" : `${(v * 100).toFixed(digits)}%`;
}

export function num(v: number | null | undefined, digits = 0): string {
  return v == null
    ? "—"
    : v.toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function mean(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
