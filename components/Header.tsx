"use client";

import { Stethoscope } from "lucide-react";
import { PersonaSelector } from "@/components/PersonaSelector";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-soft">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-foreground">
              CareNav
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Clinical &amp; financial triage
            </span>
          </div>
        </div>
        <PersonaSelector />
      </div>
    </header>
  );
}
