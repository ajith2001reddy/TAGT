import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value
    const role = request.cookies.get("role")?.value
    const path = request.nextUrl.pathname

    // Not logged in
    if (!token) {
        if (path.startsWith("/resident") || path.startsWith("/dashboard")) {
            return NextResponse.redirect(new URL("/login", request.url))
        }
    }

    // Role protection
    if (path.startsWith("/resident") && role !== "resident") {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    if (path.startsWith("/dashboard") && role !== "owner" && role !== "super_admin") {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/resident/:path*", "/dashboard/:path*"],
}