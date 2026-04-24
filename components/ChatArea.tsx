"use client";

import { useEffect, useRef, useState } from "react";
import PersonaSelector from "@/components/PersonaSelector";
import SymptomInput from "@/components/SymptomInput";
import Dashboard from "@/components/Dashboard";
import EmergencyBanner from "@/components/EmergencyBanner";
import { TriageResult } from "@/types";
import { AlertTriangle, HeartPulse, RefreshCw } from "lucide-react";

type AppView = "persona" | "symptoms" | "results";

export default function ChatArea() {
  const [view, setView] = useState<AppView>("persona");
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === "results" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [view]);

  const handlePersonaSelect = (id: string) => {
    setSelectedPersonaId(id);
    setView("symptoms");
    setTriageResult(null);
    setError(null);
  };

  const handleSymptomSubmit = async () => {
    if (!symptoms.trim() || !selectedPersonaId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptoms.trim(), personaId: selectedPersonaId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }
      const data: TriageResult = await res.json();
      setTriageResult(data);
      setView("results");
      // Dispatch sidebar update event
      window.dispatchEvent(
        new CustomEvent("updateSidebar", {
          detail: {
            sources: [],
            matched_categories: data.matched_categories,
            emergency_detected: data.emergency_detected,
          },
        })
      );
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = async (question: string) => {
    setSymptoms(question);
    setView("symptoms");
    // Auto-submit the follow-up
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: question, personaId: selectedPersonaId }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: TriageResult = await res.json();
      setTriageResult(data);
      setView("results");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView("persona");
    setSelectedPersonaId("");
    setSymptoms("");
    setTriageResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">CareNav</h1>
              <p className="text-xs text-slate-500">UMD Health Assistant</p>
            </div>
          </div>
          {view !== "persona" && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Start over
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Step 1 — Persona Selection */}
          {view === "persona" && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Who are you today?
                </h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Select a patient profile so CareNav can tailor its care recommendations to your insurance, schedule, and financial situation.
                </p>
              </div>
              <PersonaSelector
                selectedId={selectedPersonaId}
                onSelect={handlePersonaSelect}
              />
            </div>
          )}

          {/* Step 2 — Symptom Input */}
          {view === "symptoms" && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  What brings you in today?
                </h2>
                <p className="text-slate-500 text-sm">
                  Describe your symptoms in plain English. Be as specific as you can.
                </p>
              </div>
              <SymptomInput
                value={symptoms}
                onChange={setSymptoms}
                onSubmit={handleSymptomSubmit}
                isLoading={isLoading}
              />
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Results */}
          {view === "results" && triageResult && (
            <div ref={resultRef} className="animate-fade-in">
              {triageResult.emergency_detected && (
                <EmergencyBanner />
              )}
              <Dashboard
                result={triageResult}
                onFollowUpClick={handleFollowUp}
              />
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 bg-white dark:bg-slate-800">
        <p className="text-center text-xs text-slate-400">
          CareNav provides general guidance only, not medical advice. In an emergency, call 911 immediately.
        </p>
      </div>
    </div>
  );
}
