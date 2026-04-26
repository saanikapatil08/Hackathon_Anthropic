"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { personas, type Persona } from "./triage";

interface PersonaContextValue {
  personas: Persona[];
  persona: Persona;
  setPersonaId: (id: string) => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [personaId, setPersonaId] = useState<string>(personas[0].id);

  const value = useMemo<PersonaContextValue>(() => {
    const persona = personas.find((p) => p.id === personaId) ?? personas[0];
    return { personas, persona, setPersonaId };
  }, [personaId]);

  return (
    <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be used inside PersonaProvider");
  return ctx;
}
