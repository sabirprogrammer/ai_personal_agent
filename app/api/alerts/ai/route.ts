import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { hasInsforgeAdminKey, insforgeAdmin } from "@/lib/insforge-admin";
import { loadMockDB } from "@/lib/mock-db-store";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal Server Error";
}

export async function POST(req: NextRequest) {
  try {
    const { alertId, feature, replyContext } = await req.json();

    if (!alertId || !feature) {
      return NextResponse.json(
        { error: "Required fields: alertId, feature" },
        { status: 400 }
      );
    }

    let alert: any = null;

    if (!hasInsforgeAdminKey) {
      const db = loadMockDB();
      alert = db.alerts.find(a => a.id === alertId);
    } else {
      const { data, error: dbError } = await insforgeAdmin.database
        .from("alerts")
        .select("*")
        .eq("id", alertId)
        .maybeSingle();

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }
      alert = data;
    }

    if (!alert) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Return simulated AI responses when GEMINI_API_KEY is not configured
      let simulatedResult = "";
      if (feature === "summary") {
        simulatedResult = `• Urgent request to review Q2 presentation slides before tomorrow's meeting.\n• John requests feedback on increasing marketing budget by 10%.\n• Action is required by 4:45 PM today.`;
      } else if (feature === "next_action") {
        simulatedResult = `Review the Q2 budget proposal document and message John with your approval or suggestions.`;
      } else if (feature === "reply") {
        const isEmail = alert.source_app === "gmail";
        simulatedResult = isEmail 
          ? `Dear John,\n\nI have reviewed the Q2 slides and marketing budget proposal. I think a 10% increase makes sense given our current roadmap goals. I'll make sure to get the slides over to you by 4:45 PM.\n\nBest regards,\nRahul`
          : `Hey! The terms look good. I'll verify the coffee sync schedule and confirm details.`;
      }
      return NextResponse.json({ result: simulatedResult });
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    let prompt = "";

    if (feature === "summary") {
      prompt = `You are Alyla, an advanced AI personal assistant. Generate a concise, clear summary of this alert.
      
Alert Title: ${alert.title}
Source App: ${alert.source_app}
Description: ${alert.description}
Details: ${alert.full_details || "None provided"}

Instructions:
- Provide 2-3 bullet points highlighting the most critical information.
- Focus on what the user needs to know.
- Keep the summary short and readable (under 60 words total).
- Do not use markdown titles, just plain bullets.`;
    } else if (feature === "next_action") {
      prompt = `You are Alyla, an advanced AI personal assistant. Suggest the single best next action the user should take to resolve this alert.
      
Alert Title: ${alert.title}
Source App: ${alert.source_app}
Description: ${alert.description}
Details: ${alert.full_details || "None provided"}
Condition: ${alert.condition || "None"}

Instructions:
- Suggest 1 clear, direct, and actionable step.
- Keep it under 25 words.
- Be extremely practical (e.g. "Draft an update message to Sarah", "Review the budget spreadsheet", "Confirm receipt of payment").`;
    } else if (feature === "reply") {
      const isEmail = alert.source_app === "gmail";
      prompt = isEmail
        ? `You are Alyla, an AI personal assistant. Draft a professional, concise email reply to the sender of this alert.
        
Alert Details:
Title: ${alert.title}
Description: ${alert.description}
Full Text: ${alert.full_details || "None"}
${replyContext ? `User context/instruction: ${replyContext}` : ""}

Instructions:
- Write a professional, friendly email reply.
- Keep it short (2-3 paragraphs max).
- Address any specific queries in the message.
- Output only the email body text, no subject lines or headers.`
        : `You are Alyla, an AI personal assistant. Draft a concise, natural message reply for this chat alert.
        
Alert Details:
Sender: ${alert.title}
Message: ${alert.description}
${replyContext ? `User context/instruction: ${replyContext}` : ""}

Instructions:
- Write a natural, friendly chat message reply.
- Keep it brief (1-3 sentences max).
- Output only the message text, no formatting.`;
    } else {
      return NextResponse.json({ error: "Invalid feature requested" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const resultText = response.text || "";

    return NextResponse.json({ result: resultText.trim() });
  } catch (err: unknown) {
    console.error("Error in POST /api/alerts/ai:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
