export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function differenceInDays(d1: Date, d2: Date): number {
  const timeDiff = Math.abs(d1.getTime() - d2.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
