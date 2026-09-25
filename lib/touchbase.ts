// Touch Base calls happen Tuesday and Friday. Each period runs from the
// previous call to this one, with the cut-off at the 2:00 PM Central call time so
// work done right up to the call lands in that call's summary.
const TZ = "America/Chicago";
const CUTOFF_HOUR = 14;
const MEETING_DAYS = [2, 5]; // Tue, Fri

export interface TouchBasePeriod {
  key: string; // meeting date YYYY-MM-DD (Central)
  start: Date;
  end: Date;
  label: string;
  range: string;
}

function chicagoParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour") };
}

function keyToUTCDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(key: string, n: number) {
  const dt = keyToUTCDate(key);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

function weekday(key: string) {
  return keyToUTCDate(key).getUTCDay();
}

function cutoff(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  for (const offset of [5, 6]) {
    const dt = new Date(Date.UTC(y, m - 1, d, CUTOFF_HOUR + offset));
    if (chicagoParts(dt).h === CUTOFF_HOUR) return dt;
  }
  return new Date(Date.UTC(y, m - 1, d, CUTOFF_HOUR + 6));
}

function prevMeeting(key: string) {
  let k = addDays(key, -1);
  while (!MEETING_DAYS.includes(weekday(k))) k = addDays(k, -1);
  return k;
}

function fmtDay(key: string) {
  return keyToUTCDate(key).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function periodFor(key: string): TouchBasePeriod {
  const prev = prevMeeting(key);
  return {
    key,
    start: cutoff(prev),
    end: cutoff(key),
    label: `${fmtDay(key)} touch base`,
    range: `${fmtDay(prev)} 2 PM to ${fmtDay(key)} 2 PM CT`,
  };
}

export function isMeetingKey(key: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && MEETING_DAYS.includes(weekday(key));
}

// The upcoming call: the first Tue/Fri whose cut-off is still ahead of now.
export function currentPeriod(now = new Date()): TouchBasePeriod {
  const p = chicagoParts(now);
  let key = `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
  for (let i = 0; i < 8; i++) {
    if (MEETING_DAYS.includes(weekday(key)) && cutoff(key) > now) break;
    key = addDays(key, 1);
  }
  return periodFor(key);
}

export function recentPeriods(count = 10): TouchBasePeriod[] {
  const list = [currentPeriod()];
  while (list.length < count) list.push(periodFor(prevMeeting(list[list.length - 1].key)));
  return list;
}
