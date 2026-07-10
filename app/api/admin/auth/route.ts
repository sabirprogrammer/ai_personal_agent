import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAdminCredentials, createToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email/Username and Password are required" }, { status: 400 });
    }

    const isValid = validateAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid Admin Credentials" }, { status: 401 });
    }

    // Generate token
    const token = createToken({
      role: "admin",
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString()
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours session expiry
      path: "/"
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin Login API error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
