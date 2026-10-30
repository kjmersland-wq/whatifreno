import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Staging wall. Runs on the edge in front of every route (pages and APIs). A request passes
 * only with a valid signed `whatifreno_auth` cookie; everyone else is sent to /gatekeeper.
 * API callers get a 401 instead of an HTML redirect.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/gatekeeper" || (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const gate = new URL("/gatekeeper", request.url);
  if (pathname !== "/") gate.searchParams.set("next", pathname + search);
  return NextResponse.redirect(gate);
}

export const config = {
  // Everything except Next internals, static assets and the favicon.
  matcher: ["/((?!_next/|static/|favicon\\.ico).*)"],
};
