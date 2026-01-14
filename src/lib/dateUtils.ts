export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getDaysInYear(year: number = new Date().getFullYear()): number {
  return isLeapYear(year) ? 366 : 365;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysRemaining(date: Date = new Date()): number {
  const totalDays = getDaysInYear(date.getFullYear());
  const currentDay = getDayOfYear(date);
  return totalDays - currentDay;
}

export function getYearProgress(date: Date = new Date()): number {
  const currentDay = getDayOfYear(date);
  const totalDays = getDaysInYear(date.getFullYear());
  return (currentDay / totalDays) * 100;
}

export function getDateFromDayOfYear(dayOfYear: number, year: number = new Date().getFullYear()): Date {
  const date = new Date(year, 0);
  date.setDate(dayOfYear);
  return date;
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric",
    year: "numeric"
  });
}
