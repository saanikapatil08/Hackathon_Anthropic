"use client";

import TriageOptionCard from "@/components/TriageOptionCard";
import type { Tier, TriageOption } from "@/app/lib/triage";

interface Props {
  options: TriageOption[];
}

const TIER_ORDER: Record<Tier, number> = {
  recommended: 0,
  alternative: 1,
  not_recommended: 2,
};

export default function DecisivenessDashboard({ options }: Props) {
  const sorted = [...options].sort(
    (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sorted.map((opt) => (
        <TriageOptionCard key={opt.facility_id} option={opt} />
      ))}
    </div>
  );
}
