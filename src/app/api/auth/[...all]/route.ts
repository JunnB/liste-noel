import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Temporary simple auth handler - will be improved later
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.includes("sign-up")) {
    const { email, password, name } = await request.json();

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, name, password: hashedPassword },
      });

      return NextResponse.json({ user });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  }

  if (pathname.includes("sign-in")) {
    const { email, password } = await request.json();

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, user.password || "");
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      return NextResponse.json({ user });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to sign in" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  if (url.pathname.includes("get-session")) {
    // Get user from request header or cookie
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json({ user });
  }

  if (url.pathname.includes("sign-out")) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
