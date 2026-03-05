import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:5000";

export async function GET(req: NextRequest) {
  try {
    const upstream = new URL("/api/explore", backendBaseUrl);
    req.nextUrl.searchParams.forEach((value, key) => {
      upstream.searchParams.set(key, value);
    });

    const response = await fetch(upstream.toString(), {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Explore proxy failed", error);
    return NextResponse.json(
      { status: "Error", message: "Failed to fetch explore images" },
      { status: 500 }
    );
  }
}
