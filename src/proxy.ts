import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PATHS = ["/api/auth/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api");

  const isPublic = isApi
    ? PUBLIC_API_PATHS.some((path) => pathname.startsWith(path))
    : PUBLIC_PATHS.some((path) => pathname === path);

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (isPublic) {
    if (!isApi && pathname === "/login" && session) {
      return NextResponse.redirect(new URL("/piutang", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (isApi) {
      return NextResponse.json({ error: "Anda belum login." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (isAdminRoute && session.role !== "BOSS") {
    if (isApi) {
      return NextResponse.json(
        { error: "Anda tidak punya akses untuk aksi ini." },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/piutang", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
