import { NextRequest, NextResponse } from "next/server";
import { hasInsforgeAdminKey, insforgeAdmin } from "@/lib/insforge-admin";
import { loadMockDB } from "@/lib/mock-db-store";

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
    let users = MOCK_USERS;
    let alerts: any[] = [];
    let rules: any[] = [];

    // 1. Fetch Users
    if (hasInsforgeAdminKey) {
      try {
        const { data: dbUsers, error: usersErr } = await insforgeAdmin.database
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (!usersErr && dbUsers && dbUsers.length > 0) {
          users = dbUsers;
        }
      } catch (err) {
        console.error("Admin API failed to load users:", err);
      }
    }

    // 2. Fetch Alerts
    if (hasInsforgeAdminKey) {
      try {
        const { data: dbAlerts, error: alertsErr } = await insforgeAdmin.database
          .from("alerts")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (!alertsErr && dbAlerts) {
          alerts = dbAlerts;
        }
      } catch (err) {
        console.error("Admin API failed to load alerts:", err);
      }
    }
    
    // Fallback to mock alerts if database search is empty or failed
    if (alerts.length === 0) {
      alerts = loadMockDB().alerts || [];
    }

    // 3. Fetch Alert Rules
    if (hasInsforgeAdminKey) {
      try {
        const { data: dbRules, error: rulesErr } = await insforgeAdmin.database
          .from("alert_rules")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (!rulesErr && dbRules) {
          rules = dbRules;
        }
      } catch (err) {
        console.error("Admin API failed to load alert rules:", err);
      }
    }
    
    // Fallback to mock rules if database search is empty or failed
    if (rules.length === 0) {
      rules = loadMockDB().rules || [];
    }

    // 4. System Status Info
    const systemStatus = {
      insforgeConnected: true,
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
      users: MOCK_USERS,
      alerts: loadMockDB().alerts || [],
      rules: loadMockDB().rules || [],
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
