"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { PersonaSummary } from "@/components/PersonaSummary";
import SymptomInput from "@/components/SymptomInput";
import { DecisivenessDashboard } from "@/components/DecisivenessDashboard";
import { HeroVisual } from "@/components/HeroVisual";
import { usePersona } from "@/app/lib/persona-context";
import { Sparkles, ShieldAlert, HeartPulse } from "lucide-react";
import type { TriageResponse } from "@/app/lib/triage";

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Sparkles;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition hover:shadow-elevated">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function HeroCopy() {
  const { persona } = usePersona();
  return (
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Clinical and financial triage, in seconds
      </div>
      <p className="mt-5 font-display text-2xl font-medium text-foreground sm:text-3xl">
        Hi, {persona.name}!
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Know exactly where to go for care.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
        Describe your symptoms in plain language. CareNav weighs urgency,
        your insurance, and what is actually open right now, then recommends
        the safest, most affordable next step.
      </p>
    </div>
  );
}

export default function CareNavApp() {
  const [result, setResult] = useState<{
    triage: TriageResponse;
    symptoms: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="mb-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <HeroCopy />
          <HeroVisual />
        </section>

        <div className="space-y-6">
          <PersonaSummary />
          <SymptomInput onResult={setResult} />

          {result && (
            <DecisivenessDashboard
              triage={result.triage}
              symptoms={result.symptoms}
            />
          )}
        </div>

        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={HeartPulse}
            title="Clinical fit"
            body="Match symptoms to the right level of care, from telehealth to the ER."
          />
          <FeatureCard
            icon={ShieldAlert}
            title="Safety first"
            body="Emergency phrases trigger an instant 911 alert before anything else."
          />
          <FeatureCard
            icon={Sparkles}
            title="Cost clarity"
            body="See estimated out-of-pocket cost based on your real plan details."
          />
        </section>
      </main>
    </div>
  );
}
