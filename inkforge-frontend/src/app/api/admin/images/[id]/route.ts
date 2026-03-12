import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl, getAdminToken, unauthorizedResponse } from "../../_shared";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: NextRequest, { params }: Params) {
  const token = getAdminToken(req);
  if (!token) return unauthorizedResponse();

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { status: "Error", message: "Image id is required" },
      { status: 400 }
    );
  }

  try {
    const upstream = new URL(`/api/admin/images/${id}`, backendBaseUrl);
    const response = await fetch(upstream.toString(), {
      method: "DELETE",
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
      { status: "Error", message: "Failed to delete image" },
      { status: 500 }
    );
  }
}
