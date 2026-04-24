import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Facility, Persona } from "@/types";
import healthResources from "@/app/lib/health_resources.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RAGSource {
  id: string;
  fileName: string;
  snippet: string;
  score: number;
}

function calculateRelevanceScore(query: string, resource: any): number {
  const queryLower = query.toLowerCase();
  const contentLower = (resource.title + " " + resource.content + " " + resource.category).toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  let matches = 0;
  queryWords.forEach((word) => {
    if (word.length > 3 && contentLower.includes(word)) matches++;
  });
  return matches / queryWords.length;
}

export async function retrieveContext(
  query: string,
  knowledgeBaseId: string = "mock",
  n: number = 3
): Promise<{ context: string; isRagWorking: boolean; ragSources: RAGSource[] }> {
  try {
    const scored = (healthResources as any).resources
      .map((resource: any) => ({ resource, score: calculateRelevanceScore(query, resource) }))
      .filter((item: any) => item.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, n);

    if (scored.length === 0) return { context: "", isRagWorking: false, ragSources: [] };

    const context = scored
      .map((item: any) => `**${item.resource.title}**\n${item.resource.content}\nContact: ${item.resource.contact || "N/A"}`)
      .join("\n\n");

    const ragSources: RAGSource[] = scored.map((item: any) => ({
      id: item.resource.id,
      fileName: item.resource.title,
      snippet: item.resource.content.substring(0, 120) + "...",
      score: item.score,
    }));

    return { context, isRagWorking: true, ragSources };
  } catch {
    return { context: "", isRagWorking: false, ragSources: [] };
  }
}

export function calculateIsOpen(facility: Facility, time: string, day: string): boolean {
  if (!facility.days_open.includes(day)) return false;
  if (facility.hours_open === "00:00" && facility.hours_close === "23:59") return true;
  const [ch, cm] = time.split(":").map(Number);
  const [oh, om] = facility.hours_open.split(":").map(Number);
  const [xh, xm] = facility.hours_close.split(":").map(Number);
  const cur = ch * 60 + cm, open = oh * 60 + om, close = xh * 60 + xm;
  return cur >= open && cur < close;
}

export function calculateEstimatedCost(facility: Facility, persona: Persona): string {
  const isHDHP = persona.insurance_type === "HDHP" && persona.deductible_remaining > 0;
  if (facility.type === "Telehealth") {
    if (!isHDHP) return "$0 copay (covered)";
    const cost = Math.round(150 * (persona.coinsurance_percentage / 100));
    return `$${cost} (${persona.coinsurance_percentage}% coinsurance after deductible)`;
  }
  if (facility.type === "Urgent Care") {
    if (isHDHP) {
      const cost = Math.round(200 * (persona.coinsurance_percentage / 100));
      return `$${cost}+ (${persona.coinsurance_percentage}% coinsurance - deductible not met)`;
    }
    return `$${persona.urgent_care_copay} copay`;
  }
  if (facility.type === "Emergency Room") {
    if (isHDHP) {
      const cost = Math.round(1500 * (persona.coinsurance_percentage / 100));
      return `$${cost}+ (${persona.coinsurance_percentage}% coinsurance - deductible not met)`;
    }
    return `$${persona.er_copay} copay`;
  }
  return "Cost unknown";
}
