import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_USERNAME } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ensureAdminUser, verifyAdminCredentials } from "@/lib/admin-auth";

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
  let isValid = false;
  try {
    const db = await getDb();
    await ensureAdminUser(db);
    isValid = await verifyAdminCredentials(db, username, password);
  } catch {
    // Keep login available if database is temporarily unreachable.
    isValid = username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD;
  }

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
