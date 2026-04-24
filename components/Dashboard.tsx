"use client";
import { TriageResult } from "@/types";
import RecommendationCard from "./RecommendationCard";
import { Brain } from "lucide-react";

interface Props { result: TriageResult; onFollowUpClick: (q: string) => void; }

export default function Dashboard({ result, onFollowUpClick }: Props) {
  const sortedRecs = [...result.recommendations].sort((a, b) => a.rank - b.rank);
  const moodEmoji: Record<string, string> = { positive: "😊", neutral: "😐", negative: "😟", curious: "🤔", frustrated: "😤", confused: "😕" };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in mb-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 mb-3">Your Triage Results</h2>
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-5 py-3 rounded-full font-medium text-base">
          <span>{moodEmoji[result.user_mood ?? "neutral"]}</span>
          <span className="italic">&ldquo;{result.summary}&rdquo;</span>
        </div>
      </div>

      {result.thinking && (
        <div className="w-full max-w-3xl mx-auto mb-8 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clinical Reasoning</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{result.thinking}</p>
          {result.matched_categories && result.matched_categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {result.matched_categories.map((cat) => (
                <span key={cat} className="text-xs bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full font-mono">{cat}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {sortedRecs.map((rec, i) => (
          <div key={rec.facility_id} className="animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
            <RecommendationCard rec={rec} />
          </div>
        ))}
      </div>

      {result.suggested_questions && result.suggested_questions.length > 0 && (
        <div className="w-full max-w-3xl mx-auto mb-6">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Follow-up Questions</p>
          <div className="flex flex-wrap gap-2">
            {result.suggested_questions.map((q) => (
              <button key={q} onClick={() => onFollowUpClick(q)}
                className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-full transition-colors font-medium">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
          CareNav provides general guidance only, not medical advice. Estimated costs are approximations based on provided insurance data. Always consult a licensed healthcare professional. In an emergency, call 911.
        </p>
      </div>
    </div>
  );
}
