import { NextRequest, NextResponse } from "next/server";

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

function sanitizeFileName(input: string) {
  return input
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

export async function GET(req: NextRequest) {
  try {
    const urlParam = req.nextUrl.searchParams.get("url");
    const nameParam = req.nextUrl.searchParams.get("name") ?? "tattoo-image";

    if (!urlParam) {
      console.error("Download Image API: Missing url parameter");
      return NextResponse.json({ message: "Missing url parameter" }, { status: 400 });
    }

    console.log(`Download Image API: Fetching from ${urlParam}`);

    let imageUrl = urlParam;
    try {
      const parsedUrl = new URL(urlParam);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        console.error(`Download Image API: Invalid image URL protocol: ${parsedUrl.protocol}`);
        return NextResponse.json({ message: "Invalid image URL protocol" }, { status: 400 });
      }
    } catch {
      // If it's not a valid absolute URL, check if it's a relative path
      if (urlParam.startsWith("/")) {
        const origin = req.nextUrl.origin;
        imageUrl = `${origin}${urlParam}`;
        console.log(`Download Image API: Resolved relative URL to ${imageUrl}`);
      } else {
        console.error(`Download Image API: Invalid URL: ${urlParam}`);
        return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
      }
    }

    const upstream = await fetch(imageUrl, {
      method: "GET",
      cache: "no-store",
      headers: { accept: "image/*" },
    });

    if (!upstream.ok) {
      console.error(`Download Image API: Failed to fetch source image. Status: ${upstream.status}`);
      return NextResponse.json({ message: "Failed to fetch source image" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type")?.split(";")[0].trim() || "image/jpeg";
    const ext = CONTENT_TYPE_TO_EXT[contentType] ?? "jpg";
    const safeName = sanitizeFileName(nameParam) || "tattoo-image";
    const fileName = `${safeName}.${ext}`;
    const bytes = await upstream.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "content-type": contentType,
        "content-length": String(bytes.byteLength),
        "cache-control": "no-store",
        "content-disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download Image API: Unexpected error:", error);
    return NextResponse.json({ message: "Image download failed" }, { status: 500 });
  }
}
