#!/usr/bin/env node
// Log Touch Base items from the terminal, straight into Supabase.
//
//   node scripts/tb.mjs done   "Shipped the RFMS prospect form" [--project "Builder CRM"]
//   node scripts/tb.mjs info   "Which RFMS store do new prospects go to?" --for RJ
//   node scripts/tb.mjs action "Walk Matt through the new journey board"
//   node scripts/tb.mjs list   [--period 2026-09-29]
//   node scripts/tb.mjs edit   "start of the old text" "new text"
//
// Items land in the upcoming call (the next Tue/Fri 2 PM CT) unless --period
// is given. An identical item already in that period is skipped, so re-running
// is safe. Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, read
// from .env.local next to this repo.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
try {
  for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
} catch {}

// Same period rule as lib/touchbase.ts: calls Tue and Fri, cut-off 2 PM Central.
const CUTOFF_HOUR = 14;
const MEETING_DAYS = [2, 5];

function chicago(d) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(d);
  const g = (t) => p.find((x) => x.type === t).value;
  return { key: `${g("year")}-${g("month")}-${g("day")}`, h: Number(g("hour")) };
}
const addDays = (key, n) => {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const weekday = (key) => new Date(`${key}T00:00:00Z`).getUTCDay();

function currentKey(now = new Date()) {
  let { key, h } = chicago(now);
  if (MEETING_DAYS.includes(weekday(key)) && h < CUTOFF_HOUR) return key;
  do key = addDays(key, 1);
  while (!MEETING_DAYS.includes(weekday(key)));
  return key;
}

const [cmd, ...rest] = process.argv.slice(2);
const flags = {};
const words = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith("--")) flags[rest[i].slice(2)] = rest[++i];
  else words.push(rest[i]);
}
const body = words.join(" ").trim();
const period = flags.period || currentKey();

if (cmd === "edit") {
  const [from, to] = words;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data } = await db.from("touch_base_notes").select("id").like("body", `${from.replace(/[%_]/g, "\\$&")}%`);
  if (data?.length !== 1) {
    console.error(`Expected one item starting with "${from}", found ${data?.length ?? 0}`);
    process.exit(1);
  }
  const { error } = await db.from("touch_base_notes").update({ body: to.trim() }).eq("id", data[0].id);
  if (error) throw error;
  console.log(`Updated: ${to.trim()}`);
  process.exit(0);
}

if (!["done", "info", "action", "list"].includes(cmd) || (cmd !== "list" && !body)) {
  console.error('Usage: tb.mjs done|info|action "text" [--project NAME] [--for RJ|Matt|Both] [--period YYYY-MM-DD]\n       tb.mjs list [--period YYYY-MM-DD]');
  process.exit(1);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

if (cmd === "list") {
  const { data, error } = await db
    .from("touch_base_notes")
    .select("kind, body, audience, resolved")
    .eq("period_key", period)
    .order("created_at");
  if (error) throw error;
  console.log(`Touch base ${period}: ${data.length} item(s)`);
  for (const n of data) console.log(`  [${n.kind}${n.audience ? " " + n.audience : ""}${n.resolved ? ", resolved" : ""}] ${n.body}`);
  process.exit(0);
}

let project_id = null;
if (flags.project) {
  const { data } = await db.from("projects").select("id").ilike("name", flags.project).maybeSingle();
  if (!data) {
    console.error(`No project named "${flags.project}"`);
    process.exit(1);
  }
  project_id = data.id;
}

const { data: dupe } = await db
  .from("touch_base_notes")
  .select("id")
  .eq("period_key", period)
  .eq("kind", cmd)
  .eq("body", body)
  .limit(1);
if (dupe?.length) {
  console.log(`Already logged for ${period}: ${body}`);
  process.exit(0);
}

const { error } = await db.from("touch_base_notes").insert({
  period_key: period,
  kind: cmd,
  body,
  audience: cmd === "info" ? flags.for || "Both" : null,
  project_id,
  author: flags.author || "Mela",
});
if (error) throw error;
console.log(`Logged ${cmd} for the ${period} touch base: ${body}`);
