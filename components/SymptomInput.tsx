"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Wallet,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { usePersona } from "@/app/lib/persona-context";

const EXAMPLES = [
  "I sliced my hand while cooking, it's bleeding a lot.",
  "I think I'm getting the flu - sore throat, cough, fever.",
  "I twisted my ankle and can barely put weight on it.",
  "I've been feeling really anxious and can't sleep.",
];

interface SymptomInputProps {
  loading: boolean;
  onSubmit: (symptom: string) => void;
}

export default function SymptomInput({ loading, onSubmit }: SymptomInputProps) {
  const { persona } = usePersona();
  const [text, setText] = useState("");

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          What&apos;s going on?
        </h1>
        <p className="text-muted-foreground">
          Describe your symptoms in plain English. We&apos;ll cross-reference{" "}
          <span className="font-medium text-foreground">{persona.name}&apos;s</span>{" "}
          insurance and what&apos;s open right now to recommend the right place
          to go.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. I sliced my hand while cooking, it's bleeding a lot."
            disabled={loading}
            rows={4}
            className="resize-none text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit(text);
              }
            }}
          />
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 rounded border bg-muted">⌘</kbd>{" "}
              + <kbd className="px-1 py-0.5 rounded border bg-muted">Enter</kbd>{" "}
              to submit
            </p>
            <Button
              onClick={() => submit(text)}
              disabled={loading || !text.trim()}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {loading ? "Triaging..." : "Get my options"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">
          Try:
        </span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            disabled={loading}
            onClick={() => {
              setText(ex);
              submit(ex);
            }}
            className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      <PersonaSummary />
    </div>
  );
}

function PersonaSummary() {
  const { persona } = usePersona();
  const items = [
    {
      icon: <ShieldCheck className="w-4 h-4" />,
      label: "Plan",
      value: `${persona.insurance_type} · $${persona.deductible_remaining.toLocaleString()} deductible left`,
    },
    {
      icon: <Wallet className="w-4 h-4" />,
      label: "Wallet",
      value: `$${persona.bank_balance.toLocaleString()} available`,
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      label: "Location",
      value: persona.location,
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Time",
      value: persona.current_time_label,
    },
  ];

  return (
    <Card className="bg-muted/40">
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          Triage context for {persona.name}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((it) => (
            <div key={it.label} className="flex items-start gap-2">
              <div className="mt-0.5 text-muted-foreground">{it.icon}</div>
              <div className="leading-tight">
                <div className="text-xs text-muted-foreground">{it.label}</div>
                <div className="text-sm font-medium">{it.value}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
