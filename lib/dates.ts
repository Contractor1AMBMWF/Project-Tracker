// Epoch milliseconds for `days` days before now.
export function daysAgoMs(days: number) {
  return Date.now() - days * 864e5;
}
