import { ORDINALS, NUM_WORDS, MONTHS } from "./constants";

export function ordinal(i: number): string {
  return ORDINALS[i] || (i + 1) + 'th';
}
export function numWords(n: number): string {
  return NUM_WORDS[n] || String(n);
}
export function formatDateShort(d: string): string {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
}
export function formatDateLong(d: string): string {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  const day = dt.getDate();
  const mo = MONTHS[dt.getMonth()];
  const s = (day === 1 || day === 21 || day === 31) ? 'st' :
    (day === 2 || day === 22) ? 'nd' :
    (day === 3 || day === 23) ? 'rd' : 'th';
  return `${day}${s} day of ${mo} ${dt.getFullYear()}`;
}
export function ordinalSup(d: string): string {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  const day = dt.getDate();
  const mo = MONTHS[dt.getMonth()];
  const s = (day === 1 || day === 21 || day === 31) ? 'st' :
    (day === 2 || day === 22) ? 'nd' :
    (day === 3 || day === 23) ? 'rd' : 'th';
  return `${day}<sup>${s}</sup> day of ${mo} ${dt.getFullYear()}`;
}
export function cls(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
