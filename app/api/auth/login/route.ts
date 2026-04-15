import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, ADMIN_USERNAME, AUTH_COOKIE_NAME } from "@/lib/auth";

type LoginBody = {
  username?: string;
  password?: string;
  remember?: boolean;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request payload." },
      { status: 400 },
    );
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";
  const remember = body.remember === true;
  const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;

  if (!isValid) {
    return NextResponse.json(
      { ok: false, message: "Invalid user credentials." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
  return response;
}
