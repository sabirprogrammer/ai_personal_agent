import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasInsforgeAdminKey, insforgeAdmin } from "@/lib/insforge-admin";
import { verifyToken } from "@/lib/admin-auth";

// Static mock users as a fallback when database is empty or not using Admin Key
const MOCK_USERS = [
  {
    id: "a1f25a05-a5b7-4d63-870c-2a5485375c23",
    email: "nile@sftwtrs.ai",
    name: "Nile",
    avatar_url: null,
    auth_provider: "google",
    last_login_at: "2026-06-17T15:31:57.747+00:00",
    created_at: "2026-06-17T15:31:58.398+00:00"
  },
  {
    id: "u2",
    email: "sarah.connor@acme.com",
    name: "Sarah Connor",
    avatar_url: null,
    auth_provider: "google",
    last_login_at: "2026-07-09T08:14:22.000Z",
    created_at: "2026-07-09T08:14:22.000Z"
  },
  {
    id: "u3",
    phone: "+15550199",
    name: "Alex Mercer",
    auth_provider: "phone",
    verification_method: "sms",
    last_login_at: "2026-07-10T12:00:00.000Z",
    created_at: "2026-07-10T12:00:00.000Z"
  }
];

export async function GET(req: NextRequest) {
  try {
    // Session validation check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session")?.value;

    if (!sessionCookie || !verifyToken(sessionCookie)) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    let users: any[] = [];
    let alerts: any[] = [];
    let rules: any[] = [];

    // 1. Fetch Users
    if (hasInsforgeAdminKey) {
      const { data: dbUsers, error: usersErr } = await insforgeAdmin.database
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (usersErr) {
        console.error("Admin API failed to load users:", usersErr);
      } else if (dbUsers) {
        users = dbUsers;
      }
    }

    // 2. Fetch Alerts
    if (hasInsforgeAdminKey) {
      const { data: dbAlerts, error: alertsErr } = await insforgeAdmin.database
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (alertsErr) {
        console.error("Admin API failed to load alerts:", alertsErr);
      } else if (dbAlerts) {
        alerts = dbAlerts;
      }
    }

    // 3. Fetch Alert Rules
    if (hasInsforgeAdminKey) {
      const { data: dbRules, error: rulesErr } = await insforgeAdmin.database
        .from("alert_rules")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (rulesErr) {
        console.error("Admin API failed to load alert rules:", rulesErr);
      } else if (dbRules) {
        rules = dbRules;
      }
    }

    // 4. System Status Info
    const systemStatus = {
      insforgeConnected: hasInsforgeAdminKey,
      insforgeMode: hasInsforgeAdminKey ? "Production (Admin Key Active)" : "Simulated Sandbox Mode",
      geminiConnected: !!process.env.GEMINI_API_KEY,
      triggerDevConnected: true,
      uptime: process.uptime()
    };

    return NextResponse.json({
      success: true,
      users,
      alerts,
      rules,
      systemStatus
    });
  } catch (err) {
    console.error("Unhandled error in Admin Data API:", err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Internal Server Error",
      users: [],
      alerts: [],
      rules: [],
      systemStatus: {
        insforgeConnected: false,
        insforgeMode: "Error / Fallback",
        geminiConnected: false,
        triggerDevConnected: false,
        uptime: 0
      }
    }, { status: 500 });
  }
}
