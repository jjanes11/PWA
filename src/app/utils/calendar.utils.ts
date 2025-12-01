/**
 * Utility functions for calendar operations
 * Single responsibility: Date and month calculations
 */

export interface MonthData {
  year: number;
  month: number; // 0-11 (JavaScript month)
  id: string;
}

/**
 * Generate a unique ID for a month
 */
export function generateMonthId(year: number, month: number): string {
  return `month-${year}-${month}`;
}

/**
 * Create a MonthData object from year and month
 */
export function createMonthData(year: number, month: number): MonthData {
  return {
    year,
    month,
    id: generateMonthId(year, month)
  };
}

/**
 * Generate an array of months with offsets from a reference date
 */
export function generateMonthRange(
  referenceDate: Date,
  startOffset: number,
  endOffset: number
): MonthData[] {
  const months: MonthData[] = [];
  const baseYear = referenceDate.getFullYear();
  const baseMonth = referenceDate.getMonth();

  for (let offset = startOffset; offset <= endOffset; offset++) {
    const date = new Date(baseYear, baseMonth + offset, 1);
    months.push(createMonthData(date.getFullYear(), date.getMonth()));
  }

  return months;
}

/**
 * Generate months before a given month
 */
export function generateMonthsBefore(
  monthData: MonthData,
  count: number
): MonthData[] {
  const months: MonthData[] = [];
  const baseDate = new Date(monthData.year, monthData.month, 1);

  for (let i = count; i >= 1; i--) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    months.push(createMonthData(date.getFullYear(), date.getMonth()));
  }

  return months;
}

/**
 * Generate months after a given month
 */
export function generateMonthsAfter(
  monthData: MonthData,
  count: number
): MonthData[] {
  const months: MonthData[] = [];
  const baseDate = new Date(monthData.year, monthData.month, 1);

  for (let i = 1; i <= count; i++) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
    months.push(createMonthData(date.getFullYear(), date.getMonth()));
  }

  return months;
}

/**
 * Sort months chronologically
 */
export function sortMonthsChronologically(months: MonthData[]): MonthData[] {
  return [...months].sort((a, b) => {
    const dateA = new Date(a.year, a.month, 1).getTime();
    const dateB = new Date(b.year, b.month, 1).getTime();
    return dateA - dateB;
  });
}

/**
 * Check if two months are the same
 */
export function isSameMonth(a: MonthData, b: MonthData): boolean {
  return a.year === b.year && a.month === b.month;
}

/**
 * Find a month in an array
 */
export function findMonth(
  months: MonthData[],
  year: number,
  month: number
): MonthData | undefined {
  return months.find(m => m.year === year && m.month === month);
}

/**
 * Convert day of week from Sunday-first (0-6) to Monday-first (0-6)
 * Sunday (0) becomes 6, Monday (1) becomes 0, etc.
 */
export function convertDayOfWeekToMondayFirst(sundayFirstDay: number): number {
  return sundayFirstDay === 0 ? 6 : sundayFirstDay - 1;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Get previous month from a date
 */
export function getPreviousMonth(date: Date): MonthData {
  const prevDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return createMonthData(prevDate.getFullYear(), prevDate.getMonth());
}
