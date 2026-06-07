/**
 * @param inputDate 
 * @returns 
 */
export function getWeekBounds(inputDate: string | Date): {
  weekStart: Date;
  weekEnd: Date;
} {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  const dayOfWeek = date.getDay();

  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - daysToMonday);
  weekStart.setHours(0, 0, 0, 0); // Start of day
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999); // End of day

  return { weekStart, weekEnd };
}

/**
 * @param inputDate 
 * @returns 
 */
export function getWeekDates(inputDate: string | Date): Date[] {
  const { weekStart, weekEnd } = getWeekBounds(inputDate);
  const dates: Date[] = [];

  for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
    const dateOnly = new Date(d);
    dateOnly.setHours(0, 0, 0, 0);
    dates.push(dateOnly);
  }

  return dates;
}

/**
 * @param inputDate - 
 * @returns 
 */
export function getWeekDayNames(inputDate: string | Date): string[] {
  const dates = getWeekDates(inputDate);
  return dates.map((date) =>
    date.toLocaleDateString("en-US", { weekday: "short" })
  );
}

/**
 * @param date 
 * @returns
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split("T")[0];
}
