import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyToken,
  verifyRefreshToken,
  signToken,
  signRefreshToken,
} from "./lib/auth";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/test-db",
  "/api/debug",
  "/api/teams",
  "/api/submissions",
  "/",
];

const GUEST_ONLY = ["/login", "/register"];

const ROLE_ROUTES: Record<string, string> = {
  admin: "/admin",
  judge: "/judge",
  contestant: "/contestant",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public route → cho qua
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let user = token ? verifyToken(token) : null;

  // Nếu token hết hạn nhưng có refresh token → cấp token mới
  if (!user && refreshToken) {
    const data = verifyRefreshToken(refreshToken);
    if (data) {
      const newToken = signToken(data);
      const newRefresh = signRefreshToken(data);

      const res = NextResponse.next();
      res.cookies.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      res.cookies.set("refreshToken", newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      res.cookies.set("refreshToken", newRefresh, {
        httpOnly: true,
        path: "/",
      });
      user = data;
      return res;
    }
  }

  // GUEST ONLY (login/register) → nếu đã login → redirect dashboard
  if (GUEST_ONLY.some((p) => pathname.startsWith(p))) {
    if (user) {
      return NextResponse.redirect(
        new URL(`${ROLE_ROUTES[user.role]}/dashboard`, request.url)
      );
    }
    return NextResponse.next();
  }

  // Từ đây trở xuống cần login
  if (!user) {
    // API request → trả JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Kiểm tra role
  for (const role of Object.keys(ROLE_ROUTES)) {
    if (pathname.startsWith(ROLE_ROUTES[role]) && user.role !== role) {
      // API → trả lỗi
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Web → redirect dashboard đúng role
      return NextResponse.redirect(
        new URL(`${ROLE_ROUTES[user.role]}/dashboard`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
