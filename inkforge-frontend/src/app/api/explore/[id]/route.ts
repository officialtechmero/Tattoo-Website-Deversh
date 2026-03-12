import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:5000";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { status: "Error", message: "Image id is required" },
        { status: 400 }
      );
    }

    const upstream = new URL(`/api/explore/${id}`, backendBaseUrl);
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
    console.error("Explore by id proxy failed", error);
    return NextResponse.json(
      { status: "Error", message: "Failed to fetch explore image" },
      { status: 500 }
    );
  }
}
