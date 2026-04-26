"use client";

import { usePersona } from "@/app/lib/persona-context";
import { Wallet, ShieldCheck, MapPin, Clock } from "lucide-react";

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function PersonaSummary() {
  const { persona } = usePersona();

  return (
    <section className="rounded-2xl border border-border/70 bg-gradient-surface p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Active profile
          </div>
          <h2 className="mt-0.5 text-lg font-semibold text-foreground">
            {persona.name}{" "}
            <span className="font-normal text-muted-foreground">
              · {persona.description}
            </span>
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={ShieldCheck}
          label="Insurance"
          value={persona.insurance_label}
        />
        <Stat
          icon={Wallet}
          label="Cash on hand"
          value={`$${persona.cash_on_hand.toLocaleString()}`}
        />
        <Stat icon={MapPin} label="Location" value={persona.location} />
        <Stat icon={Clock} label="Current time" value={persona.current_context} />
      </div>
    </section>
  );
}
