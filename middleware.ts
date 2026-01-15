import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/api/discord/resolve-user"]; // paths that don't require login

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the token from the request (NextAuth JWT)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If no token, redirect to homepage
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // User is logged in
  return NextResponse.next();
}
