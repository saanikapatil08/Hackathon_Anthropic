"use client";

import { usePersona } from "@/app/lib/persona-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRound } from "lucide-react";

export function PersonaSelector() {
  const { persona, setPersonaId, personas } = usePersona();

  return (
    <div className="flex items-center gap-2">
      <UserRound className="h-4 w-4 text-muted-foreground" />
      <Select value={persona.id} onValueChange={setPersonaId}>
        <SelectTrigger className="w-[240px] bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {personas.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground"> · {p.description}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
