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

// Sign-in is switched off, so writes are open to anyone with the link.
// Actions still call this, which keeps one place to turn the check back on.
export async function requireSession() {}

export async function getActorName() {
  const store = await cookies();
  return store.get(NAME_COOKIE)?.value || "Mela";
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
