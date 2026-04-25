"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertTriangle,
  XOctagon,
  Clock,
  DollarSign,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import type { Tier, TriageOption } from "@/app/lib/triage";

const TIER_STYLES: Record<
  Tier,
  {
    label: string;
    icon: typeof CheckCircle2;
    accent: string;
    band: string;
    border: string;
    badge: string;
  }
> = {
  recommended: {
    label: "Recommended",
    icon: CheckCircle2,
    accent: "text-emerald-700 dark:text-emerald-400",
    band: "bg-emerald-500",
    border: "border-emerald-300 dark:border-emerald-900",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  alternative: {
    label: "Worth considering",
    icon: AlertTriangle,
    accent: "text-amber-700 dark:text-amber-400",
    band: "bg-amber-500",
    border: "border-amber-300 dark:border-amber-900",
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  not_recommended: {
    label: "Not recommended",
    icon: XOctagon,
    accent: "text-red-700 dark:text-red-400",
    band: "bg-red-500",
    border: "border-red-300 dark:border-red-900",
    badge: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
};

interface Props {
  option: TriageOption;
}

export default function TriageOptionCard({ option }: Props) {
  const style = TIER_STYLES[option.tier];
  const Icon = style.icon;

  return (
    <Card
      className={`relative overflow-hidden flex flex-col h-full ${style.border}`}
    >
      <div className={`h-1.5 w-full ${style.band}`} />
      <CardContent className="flex-1 flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex items-center gap-2 ${style.accent}`}>
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {style.label}
            </span>
          </div>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.badge}`}
          >
            {option.facility_type}
          </span>
        </div>

        <div>
          <div className="text-base font-semibold leading-tight">
            {option.facility_name}
          </div>
          <div className="text-sm font-medium mt-1">{option.headline}</div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {option.reasoning}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <Fact
            icon={<DollarSign className="w-4 h-4" />}
            label="Your cost"
            value={option.estimated_cost}
            highlight={option.tier === "recommended"}
          />
          <Fact
            icon={<Clock className="w-4 h-4" />}
            label="Wait"
            value={option.wait_time}
          />
          <Fact
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Network"
            value={option.network_status}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-muted-foreground self-center" />
          {option.capabilities.slice(0, 4).map((c) => (
            <span
              key={c}
              className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Fact({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={`text-sm ${
          highlight ? "font-semibold text-emerald-700 dark:text-emerald-400" : "font-medium"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
