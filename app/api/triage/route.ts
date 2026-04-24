import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { personas, facilities } from "@/lib/mockData";
import { calculateIsOpen, calculateEstimatedCost, retrieveContext } from "@/lib/utils";
import { TriageResult } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { symptoms, personaId } = await req.json();
    if (!symptoms || !personaId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const persona = personas.find((p) => p.id === personaId);
    if (!persona) return NextResponse.json({ error: "Invalid persona" }, { status: 400 });

    const { context: ragContext, isRagWorking, ragSources } = await retrieveContext(symptoms);

    const facilityContexts = facilities.map((fac) => {
      const isOpen = calculateIsOpen(fac, persona.simulated_time, persona.simulated_day);
      const estimatedCost = calculateEstimatedCost(fac, persona);
      return `ID: ${fac.id} | Name: ${fac.name} | Type: ${fac.type}\nNetwork: ${fac.network_status}\nCapabilities: ${fac.capabilities.join(", ")}\nWait: ~${fac.wait_time_minutes} min\nStatus: ${isOpen ? "OPEN" : "CLOSED"} (${persona.simulated_day} ${persona.simulated_time})\nEst. Cost: ${estimatedCost}\nAddress: ${fac.address}`;
    }).join("\n\n");

    const systemPrompt = `You are CareNav, a clinical triage assistant for University of Maryland students and staff. Always prioritize patient safety first, then financial wellbeing.

PATIENT PROFILE:
Name: ${persona.name}\nInsurance: ${persona.insurance_type} | Deductible Remaining: $${persona.deductible_remaining}\nUrgent Care Copay: $${persona.urgent_care_copay} | ER Copay: $${persona.er_copay}\nCoinsurance: ${persona.coinsurance_percentage}%\nBank Balance: $${persona.bank_balance}\nTime: ${persona.simulated_day}, ${persona.simulated_time}

FACILITIES:\n${facilityContexts}\n${isRagWorking ? "\nUMD HEALTH RESOURCES:\n" + ragContext : ""}

Return ONLY valid JSON, no markdown.

Schema: {"summary":"1-sentence plain English assessment","emergency_detected":boolean,"thinking":"2-3 sentences of clinical reasoning","user_mood":"positive|neutral|negative|curious|frustrated|confused","matched_categories":["mental_health|primary_care|sexual_health|wellness|emergency"],"suggested_questions":["Q1?","Q2?","Q3?"],"recommendations":[{"rank":1,"status":"recommended","facility_id":"f1|f2|f3","facility_name":"string","facility_type":"string","reasoning":"Clinical sentence. Financial sentence.","estimated_cost":"string","availability":"Open now|Closed - reopens X","wait_time":"~X minutes","color":"green|yellow|red","badge":"Best Option|Alternative|Last Resort"},{"rank":2,"status":"alternative",...},{"rank":3,"status":"not_recommended",...}]}

RULES: chest pain/can't breathe/not breathing/unconscious/stroke/severe bleeding/overdose/heart attack -> emergency_detected:true, ER rank 1 color green. If facility CLOSED at simulated time, note in availability and downrank. Always return exactly 3 recommendations covering all 3 facility types.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1800,
      system: systemPrompt,
      messages: [{ role: "user", content: `Patient symptoms: ${symptoms}` }],
      temperature: 0.2,
    });

    const textContent = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = JSON.parse(textContent) as TriageResult;
    const apiResponse = NextResponse.json(parsed);
    if (ragSources.length > 0) {
      apiResponse.headers.set("x-rag-sources", JSON.stringify(ragSources).replace(/[^\x00-\x7F]/g, ""));
    }
    return apiResponse;

  } catch (error) {
    console.error("CareNav Triage Error:", error);
    const fallback: TriageResult = {
      summary: "Unable to process at this time - please try again.",
      emergency_detected: false,
      thinking: "Fallback response due to API error.",
      user_mood: "neutral",
      matched_categories: [],
      suggested_questions: ["What are your most urgent symptoms?", "Do you have a fever?", "How long have you had these symptoms?"],
      recommendations: [
        { rank: 1, status: "recommended", facility_id: "f3", facility_name: "UMD Health Portal - Virtual Visit", facility_type: "Telehealth", reasoning: "Telehealth is available 24/7 and lowest cost. A virtual doctor can assess your symptoms and direct you appropriately.", estimated_cost: "$0 copay (covered)", availability: "Open 24/7", wait_time: "~8 minutes", color: "green", badge: "Best Option" },
        { rank: 2, status: "alternative", facility_id: "f1", facility_name: "GoHealth Urgent Care", facility_type: "Urgent Care", reasoning: "Urgent care handles most non-emergency conditions with physical exam capability. Check current hours before visiting.", estimated_cost: "Varies by insurance", availability: "Mon-Sat 8am-8pm", wait_time: "~25 minutes", color: "yellow", badge: "Alternative" },
        { rank: 3, status: "not_recommended", facility_id: "f2", facility_name: "University of Maryland Medical Center ER", facility_type: "Emergency Room", reasoning: "ER is reserved for true emergencies. Without confirmed emergency symptoms, the cost and wait time are very high.", estimated_cost: "$150-$350+ copay", availability: "Open 24/7", wait_time: "~180 minutes", color: "red", badge: "Last Resort" }
      ],
    };
    return NextResponse.json(fallback);
  }
}
