"use client";

import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Wallet,
  ShieldCheck,
  Stethoscope,
  Video,
  Hospital,
  Building2,
  Sparkles,
  Siren,
  ArrowRight,
  MapPin,
  Navigation,
  type LucideIcon,
} from "lucide-react";
import type { TriageOption, TriageResponse, Tier } from "@/app/lib/triage";

type FacilityLocation = {
  address: string;
  distance_mi: number;
  eta_min: number;
};

const FACILITY_LOCATIONS: Record<string, FacilityLocation> = {
  f1: { address: "412 Market St, Downtown", distance_mi: 1.2, eta_min: 7 },
  f2: { address: "1980 Mission Blvd, Midtown", distance_mi: 3.4, eta_min: 14 },
  f3: { address: "Virtual visit, anywhere", distance_mi: 0, eta_min: 2 },
};

const TIER_META: Record<
  Tier,
  {
    label: string;
    icon: LucideIcon;
    badgeClass: string;
    cardClass: string;
    accentText: string;
    rail: string;
  }
> = {
  recommended: {
    label: "Recommended",
    icon: CheckCircle2,
    badgeClass: "bg-success/15 text-success border-success/30",
    cardClass: "border-success/40 bg-success/5",
    accentText: "text-success",
    rail: "bg-success",
  },
  alternative: {
    label: "Alternative",
    icon: AlertCircle,
    badgeClass: "bg-warning/20 text-warning-foreground border-warning/40",
    cardClass: "border-warning/40 bg-warning/5",
    accentText: "text-warning-foreground",
    rail: "bg-warning",
  },
  not_recommended: {
    label: "Not recommended",
    icon: XCircle,
    badgeClass: "bg-danger/15 text-danger border-danger/30",
    cardClass: "border-danger/30 bg-danger/5",
    accentText: "text-danger",
    rail: "bg-danger",
  },
};

const SETTING_ICON: Record<string, LucideIcon> = {
  "Urgent Care": Stethoscope,
  "Emergency Room": Hospital,
  Telehealth: Video,
  "Primary Care": Building2,
};

const TIER_ORDER: Record<Tier, number> = {
  recommended: 0,
  alternative: 1,
  not_recommended: 2,
};

function formatCost(n: number) {
  if (n === 0) return "$0";
  return `$${n.toLocaleString()}`;
}

function CareCard({ option }: { option: TriageOption }) {
  const meta = TIER_META[option.tier];
  const SettingIcon = SETTING_ICON[option.facility_type] ?? Stethoscope;
  const RecIcon = meta.icon;

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border ${meta.cardClass} shadow-soft transition hover:shadow-elevated`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${meta.rail}`} aria-hidden />

      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-foreground shadow-soft">
            <SettingIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {option.facility_type}
            </div>
            <h3 className="mt-0.5 truncate text-base font-semibold text-foreground">
              {option.facility_name}
            </h3>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.badgeClass}`}
        >
          <RecIcon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
      </div>

      <div className="px-5 pb-4">
        <p className="text-sm font-medium leading-tight text-foreground">{option.headline}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">{option.reasoning}</p>
      </div>

      <div className="mx-5 mt-1 grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-card p-3 text-xs">
        <div className="flex items-start gap-2">
          <Wallet className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Your cost
            </div>
            <div className={`text-sm font-semibold ${meta.accentText}`}>
              {formatCost(option.cost_min)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </div>
            <div className="text-sm font-semibold text-foreground">
              {option.open_status === "open" ? "Open now" : "Closed"}
            </div>
          </div>
        </div>
        <div className="col-span-2 flex items-start gap-2 border-t border-border/60 pt-2">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
          <div className="min-w-0 text-[11px] text-muted-foreground">
            {option.network_status} · {option.hours_label}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border/50 bg-card/40 px-5 py-3">
        {option.capabilities.slice(0, 4).map((c) => (
          <span
            key={c}
            className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
          >
            {c}
          </span>
        ))}
      </div>
    </article>
  );
}

export function DecisivenessDashboard({
  triage,
  symptoms,
}: {
  triage: TriageResponse;
  symptoms: string;
}) {
  const sorted = [...triage.options].sort(
    (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier],
  );

  const recommended = sorted.find((o) => o.tier === "recommended") ?? sorted[0];
  const severity = triage.severity;

  const severityClass =
    severity === "high"
      ? "bg-danger/10 text-danger border-danger/30"
      : severity === "moderate"
        ? "bg-warning/20 text-warning-foreground border-warning/40"
        : "bg-success/10 text-success border-success/30";

  const isER = recommended?.facility_type === "Emergency Room";
  const urgency =
    severity === "high" || isER
      ? {
          tone: "danger" as const,
          label: "Act now",
          headline: isER
            ? "Go to the Emergency Room without delay."
            : "Seek in-person care immediately.",
          body: "Do not wait this out. Arrange transport now and bring a photo ID and your insurance card.",
        }
      : severity === "moderate"
        ? {
            tone: "warning" as const,
            label: "Within a few hours",
            headline: "Get seen today, ideally within the next 2–4 hours.",
            body: "Keep the area clean, apply pressure if bleeding, and head to the recommended facility soon.",
          }
        : {
            tone: "success" as const,
            label: "Today or tomorrow",
            headline: "Not urgent. Book a virtual visit when convenient.",
            body: "Hydrate, rest, and monitor symptoms. Reach out sooner if anything worsens.",
          };

  const urgencyStyles = {
    danger: {
      card: "border-danger/40 bg-danger/5",
      rail: "bg-danger",
      pill: "bg-danger/15 text-danger border-danger/30",
      icon: "text-danger",
      iconBg: "bg-danger/10",
    },
    warning: {
      card: "border-warning/40 bg-warning/5",
      rail: "bg-warning",
      pill: "bg-warning/20 text-warning-foreground border-warning/40",
      icon: "text-warning-foreground",
      iconBg: "bg-warning/15",
    },
    success: {
      card: "border-success/40 bg-success/5",
      rail: "bg-success",
      pill: "bg-success/15 text-success border-success/30",
      icon: "text-success",
      iconBg: "bg-success/10",
    },
  }[urgency.tone];

  const RecSettingIcon = recommended
    ? (SETTING_ICON[recommended.facility_type] ?? Stethoscope)
    : Stethoscope;

  return (
    <section aria-label="Care recommendations" className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Your care plan
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${severityClass}`}
        >
          {severity} severity
        </span>
        <span className="text-xs text-muted-foreground">
          Based on: <span className="italic text-foreground/80">&quot;{symptoms}&quot;</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recommended action card */}
        <article className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-surface p-5 shadow-soft">
          <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended action
              </span>
            </div>
            {recommended && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <RecSettingIcon className="h-3 w-3" />
                {recommended.facility_type}
              </span>
            )}
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
            {recommended
              ? `Go to ${recommended.facility_name}.`
              : triage.symptom_summary}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {recommended?.reasoning ?? triage.symptom_summary}
          </p>
          {recommended && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1.5 font-medium text-foreground shadow-soft">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                {recommended.cost_min === 0
                  ? "$0"
                  : `~${recommended.estimated_cost} out of pocket`}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1.5 font-medium text-foreground shadow-soft">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {recommended.open_status === "open" ? "Open now" : "Closed"}
              </span>
              <span className="inline-flex items-center gap-1 text-primary">
                See details below <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          )}
        </article>

        {/* Urgent next step card */}
        <article
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-soft ${urgencyStyles.card}`}
        >
          <div className={`absolute inset-y-0 left-0 w-1 ${urgencyStyles.rail}`} aria-hidden />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${urgencyStyles.iconBg} ${urgencyStyles.icon}`}
              >
                <Siren className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Urgent next step
              </span>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${urgencyStyles.pill}`}
            >
              {urgency.label}
            </span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
            {urgency.headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{urgency.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            If symptoms suddenly worsen, call 911 immediately.
          </div>
        </article>

        {/* Get there card */}
        {recommended &&
          (() => {
            const loc = FACILITY_LOCATIONS[recommended.facility_id];
            const isVirtual = recommended.facility_type === "Telehealth";
            const mapsUrl = isVirtual
              ? "#"
              : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${recommended.facility_name} ${loc?.address ?? ""}`,
                )}`;
            return (
              <article className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-5 shadow-soft">
                <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Get there
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {isVirtual ? "Virtual" : `${loc?.distance_mi} mi`}
                  </span>
                </div>

                {/* Map preview */}
                <div className="relative mt-3 h-24 overflow-hidden rounded-xl border border-border/60 bg-gradient-surface">
                  <svg viewBox="0 0 200 96" className="absolute inset-0 h-full w-full" aria-hidden>
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-border" />
                      </pattern>
                    </defs>
                    <rect width="200" height="96" fill="url(#grid)" />
                    <path
                      d="M 18 78 Q 70 68 110 50 T 182 22"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="5 4"
                    />
                    <circle cx="18" cy="78" r="4" fill="hsl(var(--foreground))" />
                    <circle cx="182" cy="22" r="5" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
                  </svg>
                  <div className="absolute bottom-1.5 left-2 rounded-md bg-card/90 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shadow-soft">
                    You
                  </div>
                  <div className="absolute right-2 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground shadow-soft">
                    Destination
                  </div>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {recommended.facility_name}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {loc?.address ?? "Address unavailable"}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-border/60 bg-card px-2.5 py-1.5">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {isVirtual ? "Connect in" : "ETA"}
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {loc?.eta_min ?? "—"} min
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card px-2.5 py-1.5">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {isVirtual ? "Mode" : "Distance"}
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {isVirtual ? "Video call" : `${loc?.distance_mi} mi`}
                    </div>
                  </div>
                </div>

                <a
                  href={mapsUrl}
                  target={isVirtual ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {isVirtual ? "Start virtual visit" : "Navigate now"}
                </a>
              </article>
            );
          })()}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {sorted.map((option) => (
          <CareCard key={option.facility_id} option={option} />
        ))}
      </div>
    </section>
  );
}
