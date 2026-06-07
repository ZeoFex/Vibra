import { NextResponse } from "next/server";
import { demoAdminUsersByEmail } from "@/lib/mock-data/admin";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const admin = demoAdminUsersByEmail[email];
  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const configuredPassword = process.env.VIBRA_ADMIN_DEMO_PASSWORD;

  if (configuredPassword) {
    if (!safeCompare(password, configuredPassword)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "development") {
    // Local dev only: allow login when env is configured via .env.local (see .env.example).
    // No hardcoded fallback password — set VIBRA_ADMIN_DEMO_PASSWORD locally.
    return NextResponse.json(
      {
        error:
          "Admin demo login is not configured. Set VIBRA_ADMIN_DEMO_PASSWORD in .env.local (see .env.example).",
      },
      { status: 503 }
    );
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ admin });
}
