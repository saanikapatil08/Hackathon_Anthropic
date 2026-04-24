export interface Persona {
  id: string;
  name: string;
  avatar: string;
  description: string;
  insurance_type: string;
  deductible_remaining: number;
  urgent_care_copay: number;
  er_copay: number;
  coinsurance_percentage: number;
  location: string;
  simulated_time: string;
  simulated_day: string;
  bank_balance: number;
}

export interface Facility {
  id: string;
  type: "Urgent Care" | "Emergency Room" | "Telehealth";
  name: string;
  network_status: string;
  hours_open: string;
  hours_close: string;
  days_open: string[];
  capabilities: string[];
  wait_time_minutes: number;
  address: string;
}

export interface Recommendation {
  rank: 1 | 2 | 3;
  status: "recommended" | "alternative" | "not_recommended";
  facility_id: string;
  facility_name: string;
  facility_type: string;
  reasoning: string;
  estimated_cost: string;
  availability: string;
  wait_time: string;
  color: "green" | "yellow" | "red";
  badge: string;
}

export interface TriageResult {
  summary: string;
  emergency_detected: boolean;
  recommendations: Recommendation[];
  thinking?: string;
  matched_categories?: string[];
  user_mood?: "positive" | "neutral" | "negative" | "curious" | "frustrated" | "confused";
  suggested_questions?: string[];
}

export interface TriageRequest {
  symptoms: string;
  personaId: string;
}
