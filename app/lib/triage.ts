import personasData from "./personas.json";
import facilitiesData from "./facilities.json";

export type Persona = (typeof personasData.personas)[number];
export type Facility = (typeof facilitiesData.facilities)[number];

export const personas: Persona[] = personasData.personas;
export const facilities: Facility[] = facilitiesData.facilities;

export type Tier = "recommended" | "alternative" | "not_recommended";

export interface TriageOption {
  tier: Tier;
  facility_id: string;
  facility_name: string;
  facility_type: string;
  network_status: string;
  capabilities: string[];
  hours_label: string;
  open_status: "open" | "closed";
  wait_time: string;
  estimated_cost: string;
  cost_min: number;
  cost_max: number;
  headline: string;
  reasoning: string;
}

export interface TriageResponse {
  emergency: false;
  symptom: string;
  persona_id: string;
  options: TriageOption[];
  generated_by: "claude" | "mock";
}

export interface EmergencyResponse {
  emergency: true;
  message: string;
  matched_keyword: string;
}

export const EMERGENCY_KEYWORDS = [
  "chest pain",
  "can't breathe",
  "cant breathe",
  "cannot breathe",
  "shortness of breath",
  "fainting",
  "fainted",
  "passed out",
  "unconscious",
  "stroke",
  "slurred speech",
  "facial droop",
  "severe bleeding",
  "uncontrolled bleeding",
  "bleeding won't stop",
  "suicidal",
  "overdose",
  "anaphylaxis",
  "seizure",
];

export function detectEmergency(
  text: string,
): { hit: true; keyword: string } | { hit: false } {
  const lower = text.toLowerCase();
  for (const kw of EMERGENCY_KEYWORDS) {
    if (lower.includes(kw)) return { hit: true, keyword: kw };
  }
  return { hit: false };
}

export function getPersona(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

export function isFacilityOpen(facility: Facility, isoTime: string): boolean {
  const d = new Date(isoTime);
  if (Number.isNaN(d.getTime())) return true;
  const day = d.getDay();
  const hour = d.getHours() + d.getMinutes() / 60;
  if (!facility.open_days.includes(day)) return false;
  if (facility.open_hour === 0 && facility.close_hour === 24) return true;
  return hour >= facility.open_hour && hour < facility.close_hour;
}

export function hoursUntilClose(facility: Facility, isoTime: string): number {
  const d = new Date(isoTime);
  if (Number.isNaN(d.getTime())) return 0;
  if (facility.open_hour === 0 && facility.close_hour === 24) return 24;
  const hour = d.getHours() + d.getMinutes() / 60;
  return Math.max(0, facility.close_hour - hour);
}

export interface CostEstimate {
  min: number;
  max: number;
  label: string;
  rationale: string;
}

function copayFor(facility: Facility, persona: Persona): number {
  if (facility.type === "Urgent Care") return persona.urgent_care_copay;
  if (facility.type === "Emergency Room") return persona.er_copay;
  return persona.telehealth_copay;
}

export function estimateCost(
  facility: Facility,
  persona: Persona,
): CostEstimate {
  const copay = copayFor(facility, persona);
  const charge = facility.base_charge;
  const deductibleRemaining = persona.deductible_remaining;

  if (deductibleRemaining > 0) {
    const towardsDeductible = Math.min(charge, deductibleRemaining);
    const afterDeductible = Math.max(0, charge - towardsDeductible);
    const coinsurance =
      (afterDeductible * persona.coinsurance_percentage) / 100;
    const min = Math.round(towardsDeductible + coinsurance);
    const max = Math.round(min * 1.4);
    return {
      min,
      max,
      label: `$${min.toLocaleString()}-$${max.toLocaleString()}`,
      rationale: `Deductible not met ($${deductibleRemaining.toLocaleString()} remaining); you pay full charges until then plus ${persona.coinsurance_percentage}% coinsurance.`,
    };
  }

  const min = copay;
  const max = copay;
  return {
    min,
    max,
    label: copay === 0 ? "$0" : `$${copay}`,
    rationale:
      copay === 0
        ? "Deductible met and $0 copay on this plan."
        : `Deductible met; flat $${copay} copay on your ${persona.insurance_type}.`,
  };
}

const LACERATION_TERMS = [
  "cut",
  "sliced",
  "slice",
  "laceration",
  "stitches",
  "deep cut",
  "gash",
  "wound",
];
const VIRAL_TERMS = [
  "cold",
  "flu",
  "cough",
  "sore throat",
  "runny nose",
  "fever",
  "congestion",
  "sniffles",
  "earache",
];
const MENTAL_HEALTH_TERMS = [
  "anxious",
  "anxiety",
  "depressed",
  "depression",
  "panic",
  "stressed",
];
const ORTHOPEDIC_TERMS = [
  "twisted",
  "sprained",
  "sprain",
  "broken",
  "fracture",
  "x-ray",
  "ankle",
  "wrist",
];

type SymptomKind = "laceration" | "viral" | "mental_health" | "orthopedic" | "general";

function classify(symptom: string): SymptomKind {
  const s = symptom.toLowerCase();
  if (LACERATION_TERMS.some((t) => s.includes(t))) return "laceration";
  if (ORTHOPEDIC_TERMS.some((t) => s.includes(t))) return "orthopedic";
  if (MENTAL_HEALTH_TERMS.some((t) => s.includes(t))) return "mental_health";
  if (VIRAL_TERMS.some((t) => s.includes(t))) return "viral";
  return "general";
}

function waitLabel(facility: Facility, open: boolean): string {
  if (!open) return "Closed - opens later";
  const m = facility.typical_wait_minutes;
  if (m < 60) return `~${m} min wait`;
  const hours = Math.round(m / 60);
  return `~${hours} hr wait`;
}

function openLabel(facility: Facility, persona: Persona): string {
  const open = isFacilityOpen(facility, persona.current_time);
  if (!open) return `Closed at ${persona.current_time_label}`;
  if (facility.open_hour === 0 && facility.close_hour === 24)
    return "Open 24/7";
  const left = hoursUntilClose(facility, persona.current_time);
  if (left <= 2) return `Open, but closing in ~${Math.ceil(left)} hr`;
  return `Open until ${facility.close_hour > 12 ? facility.close_hour - 12 : facility.close_hour}:00 ${facility.close_hour >= 12 ? "PM" : "AM"}`;
}

function buildOption(
  tier: Tier,
  facility: Facility,
  persona: Persona,
  headline: string,
  extraReasoning: string,
): TriageOption {
  const open = isFacilityOpen(facility, persona.current_time);
  const cost = estimateCost(facility, persona);
  return {
    tier,
    facility_id: facility.id,
    facility_name: facility.name,
    facility_type: facility.type,
    network_status: facility.network_status,
    capabilities: facility.capabilities,
    hours_label: facility.hours_label,
    open_status: open ? "open" : "closed",
    wait_time: waitLabel(facility, open),
    estimated_cost: cost.label,
    cost_min: cost.min,
    cost_max: cost.max,
    headline,
    reasoning: `${extraReasoning} ${cost.rationale}`.trim(),
  };
}

function fac(type: Facility["type"]): Facility {
  const f = facilities.find((x) => x.type === type);
  if (!f) throw new Error(`Missing facility ${type}`);
  return f;
}

export function mockTriage(
  symptom: string,
  persona: Persona,
): TriageResponse {
  const kind = classify(symptom);
  const uc = fac("Urgent Care");
  const er = fac("Emergency Room");
  const th = fac("Telehealth");
  const ucOpen = isFacilityOpen(uc, persona.current_time);

  let options: TriageOption[];

  if (kind === "laceration") {
    if (ucOpen) {
      options = [
        buildOption(
          "recommended",
          uc,
          persona,
          `${uc.name} can stitch this up`,
          `Your wound likely needs stitches; ${uc.name} is in-network, ${openLabel(uc, persona).toLowerCase()}, and handles X-rays and stitches.`,
        ),
        buildOption(
          "alternative",
          th,
          persona,
          "Telehealth can advise but cannot stitch",
          "A virtual doctor can confirm urgency and guide bleeding control, but they cannot physically close the wound.",
        ),
        buildOption(
          "not_recommended",
          er,
          persona,
          "ER overkill for a controllable cut",
          `${er.name} can absolutely treat this, but typical wait is ~4 hours and charges are far higher than urgent care.`,
        ),
      ];
    } else {
      options = [
        buildOption(
          "recommended",
          er,
          persona,
          `${er.name} - urgent care is closed`,
          `${uc.name} is closed at ${persona.current_time_label}. A bleeding wound that may need stitches should be seen tonight.`,
        ),
        buildOption(
          "alternative",
          th,
          persona,
          "Telehealth to triage from home first",
          "If bleeding is controlled, a virtual doctor can confirm whether this can wait until urgent care opens tomorrow.",
        ),
        buildOption(
          "not_recommended",
          uc,
          persona,
          `${uc.name} is closed right now`,
          `Closed at ${persona.current_time_label}; not an option until it reopens.`,
        ),
      ];
    }
  } else if (kind === "viral") {
    options = [
      buildOption(
        "recommended",
        th,
        persona,
        `${th.name} - fastest, cheapest path`,
        "Cold/flu symptoms are textbook telehealth: a virtual visit can prescribe and triage in ~10 minutes.",
      ),
      buildOption(
        "alternative",
        uc,
        persona,
        ucOpen
          ? `${uc.name} if symptoms worsen`
          : `${uc.name} (closed - try tomorrow)`,
        ucOpen
          ? "Reasonable in-person backup if you need a rapid flu/strep test."
          : `Closed at ${persona.current_time_label}; consider tomorrow if symptoms worsen.`,
      ),
      buildOption(
        "not_recommended",
        er,
        persona,
        "ER not appropriate for viral symptoms",
        "Long waits, high cost, and no clinical advantage over telehealth or urgent care for routine viral illness.",
      ),
    ];
  } else if (kind === "mental_health") {
    options = [
      buildOption(
        "recommended",
        th,
        persona,
        `${th.name} mental health visit`,
        "A virtual mental health consult is fast, private, and can connect you to ongoing care.",
      ),
      buildOption(
        "alternative",
        uc,
        persona,
        ucOpen ? `${uc.name} can refer out` : `${uc.name} (closed)`,
        ucOpen
          ? "Urgent care can do an initial evaluation and referral, but is not a mental health specialty clinic."
          : `Closed at ${persona.current_time_label}.`,
      ),
      buildOption(
        "not_recommended",
        er,
        persona,
        "ER only if you are in crisis",
        "If you are not in immediate danger, the ER is high-cost and not the right setting. If you are, call 988 or 911.",
      ),
    ];
  } else if (kind === "orthopedic") {
    if (ucOpen) {
      options = [
        buildOption(
          "recommended",
          uc,
          persona,
          `${uc.name} has on-site X-ray`,
          `${uc.name} is in-network and ${openLabel(uc, persona).toLowerCase()}; X-ray and splinting are available on site.`,
        ),
        buildOption(
          "alternative",
          th,
          persona,
          "Telehealth to decide if you need imaging",
          "A virtual visit can triage whether an X-ray is even needed before you go anywhere.",
        ),
        buildOption(
          "not_recommended",
          er,
          persona,
          "ER reserved for severe injuries",
          `Bone deformity, open fracture, or severe pain warrants the ER - otherwise urgent care is the same care for far less money.`,
        ),
      ];
    } else {
      options = [
        buildOption(
          "recommended",
          er,
          persona,
          `${er.name} - urgent care is closed`,
          `${uc.name} is closed at ${persona.current_time_label}. ER imaging is your best route tonight if pain is significant.`,
        ),
        buildOption(
          "alternative",
          th,
          persona,
          "Telehealth to confirm urgency first",
          "A virtual doctor can confirm whether this needs ER tonight or can wait for urgent care tomorrow.",
        ),
        buildOption(
          "not_recommended",
          uc,
          persona,
          `${uc.name} is closed right now`,
          `Closed at ${persona.current_time_label}.`,
        ),
      ];
    }
  } else {
    options = [
      buildOption(
        "recommended",
        th,
        persona,
        `Start with ${th.name}`,
        "When the right level of care is unclear, a virtual visit is the fastest, cheapest way to triage.",
      ),
      buildOption(
        "alternative",
        uc,
        persona,
        ucOpen ? `${uc.name} for in-person evaluation` : `${uc.name} (closed)`,
        ucOpen
          ? `${openLabel(uc, persona)}; good fallback if telehealth recommends an in-person look.`
          : `Closed at ${persona.current_time_label}.`,
      ),
      buildOption(
        "not_recommended",
        er,
        persona,
        "Skip the ER unless symptoms are severe",
        "Long waits and high cost; reserve for life- or limb-threatening symptoms.",
      ),
    ];
  }

  return {
    emergency: false,
    symptom,
    persona_id: persona.id,
    options,
    generated_by: "mock",
  };
}
