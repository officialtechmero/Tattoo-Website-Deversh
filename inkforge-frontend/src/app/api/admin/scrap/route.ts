import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl, getAdminToken, unauthorizedResponse } from "../_shared";

export async function POST(req: NextRequest) {
  const token = getAdminToken(req);
  if (!token) return unauthorizedResponse();

  try {
    const body = await req.json();
    const upstream = new URL("/api/admin/scrap", backendBaseUrl);
    const response = await fetch(upstream.toString(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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
      { status: "Error", message: "Failed to start scraper job" },
      { status: 500 }
    );
  }
}
