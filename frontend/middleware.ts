import { COOKIE_LANGUAGE, DEFAULT_LANGUAGE } from "@/lib/config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  if (!request.cookies.get(COOKIE_LANGUAGE)) {
    response.cookies.set(COOKIE_LANGUAGE, DEFAULT_LANGUAGE, { path: "/", maxAge: 365 * 24 * 60 * 60, sameSite: "lax" })
  }
  return response
}
