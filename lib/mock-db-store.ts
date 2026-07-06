import fs from 'fs';
import path from 'path';

// Locate file in app data or project root.
// Writing inside workspace under a temp/db folder keeps it local and persistent.
const MOCK_DB_PATH = path.join(process.cwd(), 'db', 'mock_store.json');

export interface MockAlert {
  id: string;
  user_id: string;
  rule_id?: string;
  title: string;
  description: string;
  full_details: string;
  source_app: string;
  app_logo?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'triggered' | 'resolved' | 'snoozed';
  condition: string;
  requires_response: boolean;
  suggested_action: string;
  last_action?: string;
  snoozed_until?: string | null;
  triggered_at: string;
  created_at: string;
  updated_at: string;
}

export interface MockAlertRule {
  id: string;
  user_id: string;
  name: string;
  description: string;
  apps: string[];
  condition: string;
  priority: 'high' | 'medium' | 'low';
  notification_method: string;
  frequency: string;
  action: string;
  status: 'active' | 'paused' | 'archived';
  next_check_at: string;
  created_at: string;
}

interface MockDB {
  alerts: MockAlert[];
  rules: MockAlertRule[];
}

const DEFAULT_DB: MockDB = {
  rules: [
    {
      id: "rule_1",
      user_id: "demo_user",
      name: "Acme Corp Updates",
      description: "Trigger alerts for important client review items from Acme Corp",
      apps: ["gmail", "slack"],
      condition: "sender matches acme.com or body contains 'NDA' or 'budget'",
      priority: "high",
      notification_method: "in_app",
      frequency: "real_time",
      action: "notify",
      status: "active",
      next_check_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "rule_2",
      user_id: "demo_user",
      name: "Roadmap Sync Reminders",
      description: "Detect calendar schedules mentioned in WhatsApp or Slack chats",
      apps: ["whatsapp", "slack"],
      condition: "body contains 'sync' or 'coffee' or 'meeting' or 'tomorrow'",
      priority: "medium",
      notification_method: "in_app",
      frequency: "real_time",
      action: "notify",
      status: "active",
      next_check_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ],
  alerts: [
    {
      id: "alert_1",
      user_id: "demo_user",
      rule_id: "rule_1",
      title: "Urgent: Q2 Marketing Budget review",
      description: "John Doe requested feedback on a 10% marketing budget increase by 4:45 PM today.",
      full_details: "Hey Rahul,\n\nCould you send me the final Q2 presentation slides by 4:45 PM today? Also, I need your input on whether we should increase the marketing budget by 10% next quarter to accommodate the new product roadmap timeline.\n\nThanks,\nJohn",
      source_app: "gmail",
      app_logo: "/001-gmail.png",
      priority: "high",
      status: "triggered",
      condition: "body contains 'budget'",
      requires_response: true,
      suggested_action: "Review slides and draft a confirmation email to John about the 10% marketing budget increase.",
      triggered_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "alert_2",
      user_id: "demo_user",
      rule_id: "rule_1",
      title: "Action Required: NDA Client Review",
      description: "Sarah Jenkins shared the client NDA terms for review. Signature needed in 2 days.",
      full_details: "Hi Rahul,\n\nPlease review the final NDA terms from the client. Let me know if everything is good to go so we can sign off and finalize the partnership in 2 days.\n\nBest regards,\nSarah Jenkins\nDirector of Finance",
      source_app: "gmail",
      app_logo: "/001-gmail.png",
      priority: "high",
      status: "triggered",
      condition: "body contains 'NDA'",
      requires_response: true,
      suggested_action: "Review client NDA terms and notify Sarah if any clauses need adjustment.",
      triggered_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: "alert_3",
      user_id: "demo_user",
      rule_id: "rule_2",
      title: "Scheduled Sync: Coffee Tomorrow with Alex",
      description: "Alex proposed coffee sync tomorrow at 4:30 PM to discuss the product roadmap.",
      full_details: "Hey Rahul,\n\nAre you free tomorrow at 4:30 PM for coffee near the downtown office? I'd love to sync on the technical roadmap and next deployment milestones.\n\nLet me know if that works for you!\n\nCheers,\nAlex",
      source_app: "whatsapp",
      app_logo: "/002-whatsapp.png",
      priority: "medium",
      status: "snoozed",
      condition: "body contains 'coffee'",
      requires_response: false,
      suggested_action: "Add Coffee Roadmap Sync with Alex to your calendar.",
      snoozed_until: new Date(Date.now() + 3600000 * 12).toISOString(),
      triggered_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 6).toISOString()
    }
  ]
};

export function loadMockDB(): MockDB {
  try {
    const dir = path.dirname(MOCK_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(MOCK_DB_PATH)) {
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
      return DEFAULT_DB;
    }

    const raw = fs.readFileSync(MOCK_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load mock DB, returning default", err);
    return DEFAULT_DB;
  }
}

export function saveMockDB(db: MockDB) {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to save mock DB", err);
  }
}
