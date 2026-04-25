import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  detectEmergency,
  estimateCost,
  facilities,
  getPersona,
  isFacilityOpen,
  mockTriage,
  type Persona,
  type TriageResponse,
} from "@/app/lib/triage";

const requestSchema = z.object({
  symptom: z.string().min(1).max(2000),
  personaId: z.string(),
});

const optionSchema = z.object({
  tier: z.enum(["recommended", "alternative", "not_recommended"]),
  facility_id: z.string(),
  headline: z.string(),
  reasoning: z.string(),
  estimated_cost: z.string(),
  cost_min: z.number(),
  cost_max: z.number(),
  wait_time: z.string(),
  open_status: z.enum(["open", "closed"]),
});

const claudeResponseSchema = z.object({
  options: z.array(optionSchema).length(3),
});

const SYSTEM_PROMPT = `You are CareNav, a clinical and financial triage assistant. You help patients pick between three places to get care: an Urgent Care, an Emergency Room, and a Telehealth service.

You will receive:
1. The patient's symptom description in plain English.
2. The patient's profile (insurance, deductible, copays, coinsurance, location, current time).
3. A list of three facilities with hours and capabilities.

Produce exactly three options - one per facility tier ("recommended", "alternative", "not_recommended") - prioritizing in this order:
- Clinical safety (right level of care for the symptom).
- Facility availability at the patient's current time (closed = much worse choice).
- Out-of-pocket cost given the patient's specific plan and remaining deductible.

You MUST respond with ONLY valid JSON in this shape, no prose, no markdown:
{
  "options": [
    {
      "tier": "recommended" | "alternative" | "not_recommended",
      "facility_id": "<one of the provided facility ids>",
      "headline": "Short, decisive label (max ~10 words).",
      "reasoning": "1-3 sentences explaining clinical fit, hours, and cost in plain English.",
      "estimated_cost": "Dollar string like $50 or $1,500-$2,100",
      "cost_min": <number>,
      "cost_max": <number>,
      "wait_time": "Plain wait estimate, e.g. ~30 min wait or Closed - opens later",
      "open_status": "open" | "closed"
    },
    ... two more options ...
  ]
}

Each of the three facilities must appear exactly once. Use the facility ids from the input.`;

function buildUserMessage(
  symptom: string,
  persona: Persona,
): string {
  const facWithContext = facilities.map((f) => {
    const open = isFacilityOpen(f, persona.current_time);
    const cost = estimateCost(f, persona);
    return {
      ...f,
      open_at_current_time: open,
      cost_estimate_for_persona: cost,
    };
  });

  return `Patient symptom:
"""
${symptom}
"""

Patient profile:
${JSON.stringify(persona, null, 2)}

Facilities (already evaluated for open status and cost for this patient):
${JSON.stringify(facWithContext, null, 2)}

Return JSON only.`;
}

function enrichClaudeResponse(
  raw: z.infer<typeof claudeResponseSchema>,
  symptom: string,
  persona: Persona,
): TriageResponse {
  const options = raw.options.map((o) => {
    const f =
      facilities.find((x) => x.id === o.facility_id) ?? facilities[0];
    return {
      tier: o.tier,
      facility_id: f.id,
      facility_name: f.name,
      facility_type: f.type,
      network_status: f.network_status,
      capabilities: f.capabilities,
      hours_label: f.hours_label,
      open_status: o.open_status,
      wait_time: o.wait_time,
      estimated_cost: o.estimated_cost,
      cost_min: o.cost_min,
      cost_max: o.cost_max,
      headline: o.headline,
      reasoning: o.reasoning,
    };
  });

  const tierOrder = { recommended: 0, alternative: 1, not_recommended: 2 };
  options.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

  return {
    emergency: false,
    symptom,
    persona_id: persona.id,
    options,
    generated_by: "claude",
  };
}

async function callClaude(
  symptom: string,
  persona: Persona,
): Promise<TriageResponse | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });
  const model =
    process.env.CARENAV_MODEL ?? "claude-3-5-sonnet-20241022";

  const response = await client.messages.create({
    model,
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    temperature: 0.2,
    messages: [
      { role: "user", content: buildUserMessage(symptom, persona) },
      { role: "assistant", content: "{" },
    ],
  });

  const text =
    "{" +
    response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = claudeResponseSchema.parse(JSON.parse(cleaned));
  return enrichClaudeResponse(parsed, symptom, persona);
}

export async function POST(req: Request) {
  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await req.json());
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { symptom, personaId } = body;
  const persona = getPersona(personaId);
  if (!persona) {
    return Response.json({ error: "Unknown persona" }, { status: 404 });
  }

  const guard = detectEmergency(symptom);
  if (guard.hit) {
    return Response.json({
      emergency: true as const,
      message:
        "These symptoms can be life-threatening. Call 911 immediately.",
      matched_keyword: guard.keyword,
    });
  }

  try {
    const claudeResult = await callClaude(symptom, persona);
    if (claudeResult) return Response.json(claudeResult);
  } catch (err) {
    console.warn("[carenav] Claude triage failed, falling back to mock:", err);
  }

  return Response.json(mockTriage(symptom, persona));
}
