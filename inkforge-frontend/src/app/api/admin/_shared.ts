import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "tatoo_inkify_admin";

const normalizeBackendBaseUrl = (value: string) => {
  const trimmed = value.replace(/\/+$/, "");
  return trimmed.replace(/\/api$/i, "");
};

export const backendBaseUrl = normalizeBackendBaseUrl(
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000"
);

export const getAdminToken = (req: NextRequest): string | null => {
  return req.cookies.get(ADMIN_COOKIE)?.value ?? null;
};

export const unauthorizedResponse = () =>
  NextResponse.json({ status: "Error", message: "Unauthorized" }, { status: 401 });
