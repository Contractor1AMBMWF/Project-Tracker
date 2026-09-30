import { NextResponse, type NextRequest } from "next/server";

// Sign-in is switched off: every page is open. The old /login route redirects home.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login/:path*"],
};
