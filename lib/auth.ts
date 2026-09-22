import { createHash } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "amb_session";
const NAME_COOKIE = "amb_name";

function expectedSessionValue() {
  const password = process.env.APP_PASSWORD ?? "";
  return createHash("sha256").update(password).digest("hex");
}

export function checkPassword(input: string) {
  return input === (process.env.APP_PASSWORD ?? "") && input.length > 0;
}

export async function setSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, expectedSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function hasValidSession() {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return !!value && value === expectedSessionValue();
}

// Throws if called from a server action without a valid session cookie.
// Every mutating action calls this first so writes can't happen without
// the shared password, even if a form is POSTed directly.
export async function requireSession() {
  if (!(await hasValidSession())) {
    throw new Error("Not authorized");
  }
}

export async function getActorName() {
  const store = await cookies();
  return store.get(NAME_COOKIE)?.value || "Someone";
}

export async function setActorName(name: string) {
  const store = await cookies();
  store.set(NAME_COOKIE, name.trim().slice(0, 60), {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
