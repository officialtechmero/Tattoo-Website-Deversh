import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl, getAdminToken, unauthorizedResponse } from "../_shared";

export async function GET(req: NextRequest) {
  const token = getAdminToken(req);
  if (!token) return unauthorizedResponse();

  const upstream = new URL("/api/admin/images", backendBaseUrl);
  req.nextUrl.searchParams.forEach((value, key) => upstream.searchParams.set(key, value));

  try {
    const response = await fetch(upstream.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { status: "Error", message: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
