import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// Fallback high-fidelity mock database for simulator
const MOCK_EMAILS = [
  {
    id: "msg_12345",
    threadId: "thread_12345",
    from: "John Doe <john.doe@acme.com>",
    to: "Rahul <rahul@alyla.ai>",
    subject: "Q2 Slides & Marketing Budget Proposal",
    date: new Date().toISOString(),
    snippet: "Hey, could you send me the final Q2 presentation slides by 4:45 PM today? Also, I need your input...",
    body: "Hey Rahul,\n\nCould you send me the final Q2 presentation slides by 4:45 PM today? Also, I need your input on whether we should increase the marketing budget by 10% next quarter to accommodate the new product roadmap timeline.\n\nThanks,\nJohn",
    labels: ["INBOX", "UNREAD", "URGENT"]
  },
  {
    id: "msg_67890",
    threadId: "thread_67890",
    from: "Sarah Jenkins <sarah.j@finance.corp>",
    to: "Rahul <rahul@alyla.ai>",
    subject: "NDA for Client Review",
    date: new Date(Date.now() - 3600000).toISOString(),
    snippet: "Hi Rahul, please review the final NDA terms from the client. Let me know if everything is good to go...",
    body: "Hi Rahul,\n\nPlease review the final NDA terms from the client. Let me know if everything is good to go so we can sign off and finalize the partnership in 2 days.\n\nBest regards,\nSarah Jenkins\nDirector of Finance",
    labels: ["INBOX", "UNREAD"]
  },
  {
    id: "msg_11223",
    threadId: "thread_11223",
    from: "Alex Rivera <alex@startup.co>",
    to: "Rahul <rahul@alyla.ai>",
    subject: "Coffee tomorrow at 4:30 PM?",
    date: new Date(Date.now() - 7200000).toISOString(),
    snippet: "Hey! Are you free tomorrow at 4:30 PM for coffee near the downtown office? I'd love to sync...",
    body: "Hey Rahul,\n\nAre you free tomorrow at 4:30 PM for coffee near the downtown office? I'd love to sync on the technical roadmap and next deployment milestones.\n\nLet me know if that works for you!\n\nCheers,\nAlex",
    labels: ["INBOX"]
  },
  {
    id: "msg_44556",
    threadId: "thread_44556",
    from: "OpenAI Billing <billing@openai.com>",
    to: "Rahul <rahul@alyla.ai>",
    subject: "Your monthly invoice is ready",
    date: new Date(Date.now() - 86400000).toISOString(),
    snippet: "Your OpenAI API usage invoice for May is ready. The amount of $14.20 has been charged...",
    body: "Dear Customer,\n\nYour OpenAI API usage invoice for May is ready. The amount of $14.20 has been charged to your card ending in 4242.\n\nYou can access your billing dashboard to download the PDF receipt.\n\nThank you for using OpenAI services,\nThe OpenAI Team",
    labels: ["INBOX"]
  }
];

let simulatedSent: any[] = [];
let simulatedDrafts: any[] = [];

// Helper to base64url-decode email body parts
function base64UrlDecode(str: string): string {
  // Replace base64url characters to standard base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if missing
  while (base64.length % 4) {
    base64 += "=";
  }
  try {
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch (e) {
    return "";
  }
}

// Recursively extract email body text
function extractBody(payload: any): string {
  if (payload.body?.data) {
    return base64UrlDecode(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return base64UrlDecode(part.body.data);
      }
      if (part.mimeType === "text/html" && part.body?.data) {
        // Fallback to HTML if plain text isn't directly available in standard part
        return base64UrlDecode(part.body.data).replace(/<[^>]*>/g, ""); // simple tag strip
      }
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
  }
  return "";
}

// Authenticated fetch wrapper for Google API
async function fetchGoogleAPI(endpoint: string, token: string, method = "GET", body?: any) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Gmail API Error (${res.status}): ${errText}`);
  }

  return res.json();
}

// Refresh Google OAuth token helper
async function getActiveAccessToken(userId: string) {
  const { data: dbUser, error: dbError } = await insforge.database
    .from("users")
    .select("integrations")
    .eq("id", userId)
    .maybeSingle();

  if (dbError || !dbUser) {
    throw new Error("Could not retrieve user integrations from database");
  }

  const gmail = dbUser.integrations?.gmail;
  if (!gmail || gmail.isSimulated || !gmail.refreshToken) {
    // Falls back to simulated/mock data
    return null;
  }

  // Check if token is still valid (60 seconds buffer)
  if (gmail.accessToken && gmail.expiresAt && gmail.expiresAt > Date.now() + 60000) {
    return gmail.accessToken;
  }

  // Token is expired. Refresh it!
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === "your_google_client_id_here") {
    console.warn("GOOGLE_CLIENT_ID/SECRET not configured in .env. Falling back to simulation.");
    return null;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: gmail.refreshToken,
      grant_type: "refresh_token"
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to refresh Google OAuth token: ${errText}`);
  }

  const data = await res.json();
  const newAccessToken = data.access_token;
  const newExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;

  // Persist updated token to db
  const updatedIntegrations = {
    ...dbUser.integrations,
    gmail: {
      ...gmail,
      accessToken: newAccessToken,
      expiresAt: newExpiresAt
    }
  };

  await insforge.database
    .from("users")
    .update({ integrations: updatedIntegrations })
    .eq("id", userId);

  return newAccessToken;
}

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { method, params, userId, id = 1 } = requestBody;

    if (!method || !userId) {
      return NextResponse.json({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid Request: method and userId are required" },
        id
      }, { status: 400 });
    }

    const requestFrame = {
      jsonrpc: "2.0",
      method,
      params,
      id
    };

    let result: any = null;
    let error: any = null;

    // Retrieve active access token (will return null if simulated/mock connection is active)
    const token = await getActiveAccessToken(userId).catch(err => {
      console.error("Token fetch/refresh exception:", err);
      return null;
    });

    if (!token) {
      return NextResponse.json({
        jsonrpc: "2.0",
        error: { code: -32002, message: "Google Gmail account is not connected. Please connect Gmail under Settings -> Integrations." },
        id
      }, { status: 400 });
    }

    // -------------------------------------------------------------
    // REAL GMAIL CONNECTION PATH (Google API Calls)
    // -------------------------------------------------------------
    try {
      switch (method) {
        case "gmail_list_messages": {
          const q = params?.q || "label:inbox";
          const maxResults = params?.maxResults || 10;

          const listData = await fetchGoogleAPI(
            `messages?q=${encodeURIComponent(q)}&maxResults=${maxResults}`,
            token
          );
          const messages = listData.messages || [];

          // Fetch headers for each message in parallel
          const detailedMessages = await Promise.all(
            messages.map(async (msg: any) => {
              try {
                const detail = await fetchGoogleAPI(
                  `messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
                  token
                );
                const headers = detail.payload?.headers || [];
                const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
                const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "No Subject";
                const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || detail.internalDate;

                return {
                  id: detail.id,
                  threadId: detail.threadId,
                  from,
                  subject,
                  date: new Date(isNaN(Number(date)) ? date : Number(date)).toISOString(),
                  snippet: detail.snippet,
                  labels: detail.labelIds || []
                };
              } catch (e) {
                return null;
              }
            })
          );

          result = {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  messages: detailedMessages.filter(Boolean)
                }, null, 2)
              }
            ]
          };
          break;
        }

        case "gmail_get_message": {
          const messageId = params?.id;
          if (!messageId) {
            error = { code: -32602, message: "Message ID is required." };
            break;
          }

          const detail = await fetchGoogleAPI(`messages/${messageId}`, token);
          
          // Parse subject, from, body
          const headers = detail.payload?.headers || [];
          const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
          const to = headers.find((h: any) => h.name.toLowerCase() === "to")?.value || "Unknown Recipient";
          const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "No Subject";
          const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || detail.internalDate;

          let body = "";
          if (detail.payload?.body?.data) {
            body = Buffer.from(detail.payload.body.data, "base64").toString("utf-8");
          } else if (detail.payload?.parts) {
            // Traverse parts to find text/plain
            const textPart = detail.payload.parts.find((p: any) => p.mimeType === "text/plain");
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
            } else {
              const htmlPart = detail.payload.parts.find((p: any) => p.mimeType === "text/html");
              if (htmlPart?.body?.data) {
                body = Buffer.from(htmlPart.body.data, "base64").toString("utf-8");
              }
            }
          }

          result = {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  id: detail.id,
                  threadId: detail.threadId,
                  from,
                  to,
                  subject,
                  date: new Date(isNaN(Number(date)) ? date : Number(date)).toISOString(),
                  snippet: detail.snippet,
                  body,
                  labels: detail.labelIds || []
                }, null, 2)
              }
            ]
          };
          break;
        }

        case "gmail_search_messages": {
          const query = params?.q || "";
          const listData = await fetchGoogleAPI(
            `messages?q=${encodeURIComponent(query)}&maxResults=20`,
            token
          );
          const messages = listData.messages || [];

          const detailedMessages = await Promise.all(
            messages.map(async (msg: any) => {
              try {
                const detail = await fetchGoogleAPI(
                  `messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
                  token
                );
                const headers = detail.payload?.headers || [];
                const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
                const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "No Subject";
                const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || detail.internalDate;

                return {
                  id: detail.id,
                  threadId: detail.threadId,
                  from,
                  subject,
                  date: new Date(isNaN(Number(date)) ? date : Number(date)).toISOString(),
                  snippet: detail.snippet,
                  labels: detail.labelIds || []
                };
              } catch (e) {
                return null;
              }
            })
          );

          result = {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  messages: detailedMessages.filter(Boolean)
                }, null, 2)
              }
            ]
          };
          break;
        }

        case "gmail_send_message": {
          const { to, subject, body } = params || {};
          if (!to || !subject || !body) {
            error = { code: -32602, message: "to, subject, and body parameters are required." };
            break;
          }

          // Build RFC 2822 email format
          const rawEmail = [
            `To: ${to}`,
            "Content-Type: text/plain; charset=utf-8",
            "MIME-Version: 1.0",
            `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`,
            "",
            body
          ].join("\r\n");

          const base64SafeEmail = Buffer.from(rawEmail)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

          const sendData = await fetchGoogleAPI("messages/send", token, "POST", { raw: base64SafeEmail });

          result = {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: "Email sent successfully via Gmail API.",
                  messageId: sendData.id,
                  threadId: sendData.threadId
                }, null, 2)
              }
            ]
          };
          break;
        }

        case "gmail_create_draft": {
          const { to, subject, body, threadId } = params || {};
          if (!to || !subject || !body) {
            error = { code: -32602, message: "to, subject, and body parameters are required." };
            break;
          }

          // Build RFC 2822 email format
          const headers = [
            `To: ${to}`,
            "Content-Type: text/plain; charset=utf-8",
            "MIME-Version: 1.0",
            `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`
          ];
          if (threadId) {
            headers.push(`Thread-Id: ${threadId}`);
          }
          headers.push("", body);

          const rawEmail = headers.join("\r\n");
          const base64SafeEmail = Buffer.from(rawEmail)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

          const draftBody: any = {
            message: {
              raw: base64SafeEmail
            }
          };
          if (threadId) {
            draftBody.message.threadId = threadId;
          }

          const draftData = await fetchGoogleAPI("drafts", token, "POST", draftBody);

          result = {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: "Draft created successfully via Gmail API.",
                  draft: draftData
                }, null, 2)
              }
            ]
          };
          break;
        }

        case "gmail_get_thread": {
          const threadId = params?.id;
          if (!threadId) {
            error = { code: -32602, message: "Thread ID is required." };
            break;
          }

          const threadData = await fetchGoogleAPI(`threads/${threadId}`, token);
          result = {
            content: [
              {
                type: "text",
                text: JSON.stringify(threadData, null, 2)
              }
            ]
          };
          break;
        }

        default:
          error = { code: -32601, message: `Method not found: ${method}` };
      }
    } catch (apiErr: any) {
      console.error("Live Gmail API call failed:", apiErr);
      error = { code: -32603, message: apiErr.message || "Google API request failed." };
    }

    const responseFrame = error 
      ? { jsonrpc: "2.0", error, id } 
      : { jsonrpc: "2.0", result, id };

    return NextResponse.json({
      requestFrame,
      responseFrame,
      result,
      error
    });

  } catch (err: any) {
    console.error("Error in gmail-mcp API route:", err);
    return NextResponse.json({
      jsonrpc: "2.0",
      error: { code: -32603, message: err.message || "Internal Server Error" },
      id: 1
    }, { status: 500 });
  }
}
