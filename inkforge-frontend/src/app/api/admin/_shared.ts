import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "inkforge_admin_token";
export const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000").replace(/\/+$/, "");

export const getAdminToken = (req: NextRequest): string | null => {
  return req.cookies.get(ADMIN_COOKIE)?.value ?? null;
};

export const unauthorizedResponse = () =>
  NextResponse.json({ status: "Error", message: "Unauthorized" }, { status: 401 });
