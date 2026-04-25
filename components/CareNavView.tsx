"use client";

import { useState } from "react";
import SymptomInput from "@/components/SymptomInput";
import EmergencyOverlay from "@/components/EmergencyOverlay";
import DecisivenessDashboard from "@/components/DecisivenessDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { detectEmergency, type TriageResponse } from "@/app/lib/triage";
import { usePersona } from "@/app/lib/persona-context";

type ApiResult =
  | TriageResponse
  | { emergency: true; message: string; matched_keyword: string };

export default function CareNavView() {
  const { persona } = usePersona();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emergency, setEmergency] = useState<{
    open: boolean;
    keyword?: string;
  }>({ open: false });

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (symptom: string) => {
    setError(null);

    const guard = detectEmergency(symptom);
    if (guard.hit) {
      setEmergency({ open: true, keyword: guard.keyword });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptom, personaId: persona.id }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data: ApiResult = await res.json();
      if ("emergency" in data && data.emergency) {
        setEmergency({ open: true, keyword: data.matched_keyword });
        return;
      }
      setResult(data as TriageResponse);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong getting your triage.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <EmergencyOverlay
        open={emergency.open}
        matchedKeyword={emergency.keyword}
        onDismiss={() => setEmergency({ open: false })}
      />

      {result ? (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={reset} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Try another symptom
            </Button>
            <div className="text-xs text-muted-foreground">
              Decisions tailored for{" "}
              <span className="font-medium text-foreground">
                {persona.name}
              </span>{" "}
              · {persona.current_time_label} ·{" "}
              <span className="capitalize">
                via {result.generated_by === "claude" ? "Claude" : "rule-based mock"}
              </span>
            </div>
          </div>
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <span className="text-muted-foreground">Symptom:</span>{" "}
            <span className="font-medium">{result.symptom}</span>
          </div>
          <DecisivenessDashboard options={result.options} />
        </div>
      ) : (
        <SymptomInput loading={loading} onSubmit={handleSubmit} />
      )}

      {error && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-start gap-2 text-sm rounded-md border border-red-300 bg-red-50 dark:bg-red-950/40 dark:border-red-900 p-3 text-red-800 dark:text-red-200">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-medium">Triage failed</div>
              <div>{error}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
