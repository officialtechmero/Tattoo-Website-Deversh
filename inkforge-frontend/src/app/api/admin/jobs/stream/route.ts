import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl, getAdminToken, unauthorizedResponse } from "../../_shared";

export async function GET(req: NextRequest) {
  const token = getAdminToken(req);
  if (!token) return unauthorizedResponse();

  try {
    const response = await fetch(`${backendBaseUrl}/api/admin/jobs/stream`, {
      method: "GET",
      headers: {
        accept: "text/event-stream",
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "text/event-stream",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      { status: "Error", message: "Failed to stream jobs updates" },
      { status: 500 }
    );
  }
}
