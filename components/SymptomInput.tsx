"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

const CHIPS = [
  { label: "Fever & sore throat", text: "I've had a fever of 101F for 2 days and a really bad sore throat." },
  { label: "Twisted ankle", text: "I twisted my ankle and it's swollen and painful to walk on." },
  { label: "Anxiety / panic", text: "I've been having panic attacks and constant anxiety and can't focus on school." },
  { label: "Need a prescription", text: "I need a refill for my allergy medication prescription." },
  { label: "Severe headache", text: "I have a severe headache that started suddenly and my neck feels stiff." },
  { label: "Cut / wound", text: "I have a cut on my arm from broken glass, it's about 2 inches long and bleeding." },
];

interface Props { value: string; onChange: (val: string) => void; onSubmit: () => void; isLoading: boolean; }

export default function SymptomInput({ value, onChange, onSubmit, isLoading }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <h2 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Describe Your Symptoms</h2>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && value.trim() && !isLoading) { e.preventDefault(); onSubmit(); } }}
          placeholder="Describe what's wrong in plain English..."
          className="min-h-[140px] text-base p-5 pr-36 shadow-sm rounded-xl resize-none border-slate-200 focus-visible:ring-blue-400"
        />
        <Button disabled={!value.trim() || isLoading} onClick={onSubmit}
          className="absolute bottom-4 right-4 rounded-full px-5 shadow-md bg-blue-600 hover:bg-blue-700">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {isLoading ? "Analyzing..." : "Triage"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {CHIPS.map((chip) => (
          <button key={chip.label} onClick={() => onChange(chip.text)}
            className="text-sm bg-slate-100 hover:bg-blue-50 hover:border-blue-200 text-slate-700 px-4 py-2 rounded-full transition-colors font-medium border border-slate-200">
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
