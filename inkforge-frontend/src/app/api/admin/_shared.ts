import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "tatoo_inkify_admin";
export const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000/api").replace(/\/+$/, "");

export const getAdminToken = (req: NextRequest): string | null => {
  return req.cookies.get(ADMIN_COOKIE)?.value ?? null;
};

export const unauthorizedResponse = () =>
  NextResponse.json({ status: "Error", message: "Unauthorized" }, { status: 401 });
