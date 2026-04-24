import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { personas, facilities } from "@/lib/mockData";
import { calculateIsOpen, calculateEstimatedCost, retrieveContext } from "@/lib/utils";
import { TriageResult } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { symptoms, personaId } = body;

    if (!symptoms || !personaId) {
      return NextResponse.json(
        { error: "Missing required fields: symptoms and personaId" },
        { status: 400 }
      );
    }

    const persona = personas.find((p) => p.id === personaId);
    if (!persona) {
      return NextResponse.json({ error: "Invalid persona ID" }, { status: 404 });
    }

    // Retrieve RAG context
    const { context: ragContext, isRagWorking, ragSources } = await retrieveContext(symptoms).catch(() => ({
      context: "",
      isRagWorking: false,
      ragSources: [],
    }));

    // Build facility context strings
    const facilityContexts = facilities
      .map((fac) => {
        const isOpen = calculateIsOpen(fac, persona.simulated_time, persona.simulated_day);
        const estimatedCost = calculateEstimatedCost(fac, persona);
        return `ID: ${fac.id} | Name: ${fac.name} | Type: ${fac.type}\nNetwork: ${fac.network_status}\nHours: ${fac.hours_open}-${fac.hours_close} (${fac.days_open.join(",")})\nCurrently: ${isOpen ? "OPEN" : "CLOSED"}\nCapabilities: ${fac.capabilities.join(", ")}\nWait: ~${fac.wait_time_minutes} min\nEstimated cost for this patient: $${estimatedCost.toFixed(0)}\nAddress: ${fac.address || "On campus"}`;
      })
      .join("\n\n");

    const systemPrompt = `You are CareNav, a clinical triage assistant for University of Maryland students and staff. Always prioritize patient safety first, then financial wellbeing.

PATIENT PROFILE:
Name: ${persona.name}
Insurance: ${persona.insurance_type} | Deductible Remaining: $${persona.deductible_remaining}
Urgent Care Copay: $${persona.urgent_care_copay} | ER Copay: $${persona.er_copay}
Coinsurance: ${persona.coinsurance_percentage}%
Bank Balance: $${persona.bank_balance}
Time: ${persona.simulated_day}, ${persona.simulated_time}

FACILITIES:
${facilityContexts}
${isRagWorking ? "\nUMD HEALTH RESOURCES:\n" + ragContext : ""}

Return ONLY valid JSON matching this exact schema (no markdown, no extra text):
{
  "summary": "1-sentence plain English assessment",
  "emergency_detected": boolean,
  "thinking": "2-3 sentences of clinical reasoning explaining your recommendation logic",
  "user_mood": "positive|neutral|negative|curious|frustrated|confused",
  "matched_categories": ["mental_health|primary_care|sexual_health|wellness|emergency"],
  "suggested_questions": ["Follow-up Q1?", "Follow-up Q2?", "Follow-up Q3?"],
  "recommendations": [
    {
      "rank": 1,
      "status": "recommended",
      "facility_id": "f1|f2|f3",
      "facility_name": "string",
      "facility_type": "string",
      "reasoning": "Clinical sentence. Financial sentence.",
      "estimated_cost": "$XX",
      "availability": "Open now|Closed - reopens [day] at [time]",
      "wait_time": "~X minutes",
      "color": "green|yellow|red",
      "badge": "Best Option|Alternative|Last Resort"
    },
    { "rank": 2, "status": "alternative", ... },
    { "rank": 3, "status": "not_recommended", ... }
  ]
}

CRITICAL RULES:
- chest pain/can't breathe/unconscious/stroke/severe bleeding/overdose/heart attack -> emergency_detected: true, ER rank 1 with color green
- If facility is CLOSED at simulated time, note in availability field and lower its rank
- Always return EXACTLY 3 recommendations covering all 3 facility types
- Prioritize patient safety over cost savings
- Be specific with clinical reasoning; mention the patient's name`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: `Patient symptoms: ${symptoms}` }],
      temperature: 0.2,
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON — strip any accidental markdown fences
    let parsed: TriageResult;
    try {
      const cleaned = rawText.replace(/^```json\n?/i, "").replace(/\n?```$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawText);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      return NextResponse.json(
        { error: "Invalid AI response structure" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Triage API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
