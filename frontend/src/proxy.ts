import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";
  const segments = pathname.split("/").filter(Boolean);
  const currentSegment = segments[0];

  console.log(`[Proxy Debug] pathname: ${pathname}, adminPath: ${adminPath}, currentSegment: ${currentSegment}`);

  // 1. Block literal "/admin" if the secret path is different
  if (currentSegment === "admin" && adminPath !== "admin") {
    console.log(`[Proxy Debug] Blocked literal "/admin" because adminPath (${adminPath}) !== "admin"`);
    return new NextResponse(null, { status: 404 });
  }

  // 2. Identify Admin Routes
  // An admin route is one that starts with the secret adminPath
  const isLoginRoute = pathname === `/${adminPath}/login`;
  const isAdminRoute = currentSegment === adminPath && !isLoginRoute;

  // 3. Handle Public Routes
  // If it's NOT an admin route and NOT a login route, it's public (e.g., /room-configurator)
  if (!isAdminRoute && !isLoginRoute) {
    return NextResponse.next();
  }

  // 4. Admin Access Control (Redirect to login if no tokens)
  if (isAdminRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(
      new URL(`/${adminPath}/login`, request.url)
    );
  }

  // 5. Redirect to Dashboard if already logged in and visiting login page
  if (isLoginRoute && (accessToken || refreshToken)) {
    return NextResponse.redirect(
      new URL(`/${adminPath}/dashboard`, request.url)
    );
  }

  return NextResponse.next();
}

// Ensure proxy runs on relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
