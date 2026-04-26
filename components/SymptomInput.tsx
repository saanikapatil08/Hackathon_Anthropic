"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectEmergency } from "@/app/lib/triage";
import { EmergencyOverlay } from "@/components/EmergencyOverlay";
import { usePersona } from "@/app/lib/persona-context";
import type { TriageResponse } from "@/app/lib/triage";

const EXAMPLES = [
  "I sliced my hand while cooking, it is bleeding a lot",
  "Sore throat and mild fever for two days",
  "Twisted my ankle, it is swollen but I can walk",
];

interface SymptomInputProps {
  onResult: (result: { triage: TriageResponse; symptoms: string } | null) => void;
}

export default function SymptomInput({ onResult }: SymptomInputProps) {
  const { persona } = usePersona();
  const [value, setValue] = useState("");
  const [emergencyPhrase, setEmergencyPhrase] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    const guard = detectEmergency(trimmed);
    if (guard.hit) {
      setEmergencyPhrase(guard.keyword);
      onResult(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptom: trimmed, personaId: persona.id }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      if (data.emergency === true) {
        setEmergencyPhrase(data.matched_keyword ?? "emergency");
        onResult(null);
      } else {
        onResult({ triage: data as TriageResponse, symptoms: trimmed });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      onResult(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Describe what is going on
            </h2>
            <p className="text-xs text-muted-foreground">
              Plain language is fine. CareNav handles the rest.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-xl border border-input bg-background transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <textarea
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder="e.g. I sliced my hand while cooking, it is bleeding a lot."
              rows={4}
              className="block w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setValue(ex)}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-accent"
                >
                  {ex}
                </button>
              ))}
            </div>

            <Button
              type="submit"
              disabled={!value.trim() || submitting}
              className="h-10 gap-2 bg-gradient-brand text-white shadow-soft transition hover:shadow-elevated disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Get my care plan
                </>
              )}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            {error}
          </div>
        )}
      </section>

      {emergencyPhrase && (
        <EmergencyOverlay
          phrase={emergencyPhrase}
          onDismiss={() => setEmergencyPhrase(null)}
        />
      )}
    </>
  );
}
