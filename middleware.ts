import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = process.env.ADMIN_JWT_SECRET || "default_super_secret_admin_token_key_12345";

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const [header, data, signature] = token.split(".");
    if (!header || !data || !signature) return false;

    const message = `${header}.${data}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET);
    const messageData = encoder.encode(message);

    // Import the secret key for HMAC validation
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Decode signature
    const sigBuffer = base64UrlToBuffer(signature);

    // Verify HMAC-SHA256 signature
    return await crypto.subtle.verify("HMAC", key, sigBuffer, messageData);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login and API endpoints
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const isValid = await verifyToken(sessionCookie);
    if (!isValid) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
