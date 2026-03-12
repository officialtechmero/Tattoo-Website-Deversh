import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl } from "../_shared";

const ADMIN_COOKIE = "tatoo_inkify_admin";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 12;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { status: "Error", message: "Username and password are required" },
        { status: 400 }
      );
    }

    const loginUrl = new URL("/api/admin/auth/login", backendBaseUrl);
    const response = await fetch(loginUrl.toString(), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    const json = (await response.json().catch(() => ({}))) as {
      status?: string;
      token?: string;
      message?: string;
    };

    if (!response.ok || !json?.token) {
      return NextResponse.json(
        { status: "Error", message: json?.message ?? "Invalid login" },
        { status: response.status || 401 }
      );
    }

    const out = NextResponse.json({ status: "Okay", message: "Logged in" });
    out.cookies.set({
      name: ADMIN_COOKIE,
      value: json.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
    });
    return out;
  } catch {
    return NextResponse.json(
      { status: "Error", message: "Login failed" },
      { status: 500 }
    );
  }
}
