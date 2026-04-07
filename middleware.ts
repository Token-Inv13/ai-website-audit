import { NextRequest, NextResponse } from "next/server"

import { WORKSPACE_VISITOR_COOKIE, WORKSPACE_VISITOR_HEADER } from "@/lib/workspace"
import { createWorkspaceVisitorId } from "@/lib/workspace"

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const existingVisitorId = request.cookies.get(WORKSPACE_VISITOR_COOKIE)?.value?.trim()
  const visitorId = existingVisitorId || createWorkspaceVisitorId()

  requestHeaders.set(WORKSPACE_VISITOR_HEADER, visitorId)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  if (!existingVisitorId) {
    response.cookies.set({
      name: WORKSPACE_VISITOR_COOKIE,
      value: visitorId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|txt|xml|json)$).*)",
  ],
}
