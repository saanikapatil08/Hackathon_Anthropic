"use client";
import { personas } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props { selectedId: string; onSelect: (id: string) => void; }

export default function PersonaSelector({ selectedId, onSelect }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <h2 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Select Patient Persona</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {personas.map((p) => (
          <Card key={p.id} onClick={() => onSelect(p.id)}
            className={cn("cursor-pointer p-4 transition-all duration-200 hover:shadow-md border-2",
              p.id === selectedId ? "border-blue-500 bg-blue-50/40 shadow-md" : "border-slate-100 hover:border-slate-300")}>
            <div className="flex items-center gap-4">
              <div className="text-4xl select-none">{p.avatar}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                <p className="text-sm text-slate-500 truncate">{p.description} &bull; {p.insurance_type}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {p.simulated_day}, {p.simulated_time} &bull; ${p.bank_balance.toLocaleString()} balance
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
