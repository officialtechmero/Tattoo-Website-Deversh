import { NextResponse } from "next/server";

const ADMIN_COOKIE = "inkforge_admin_token";

export async function POST() {
  const response = NextResponse.json({ status: "Okay", message: "Logged out" });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
