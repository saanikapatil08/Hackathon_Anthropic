"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ChevronDown, Stethoscope, Check } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePersona } from "@/app/lib/persona-context";

const TopNavBar = () => {
  const { theme, setTheme } = useTheme();
  const { personas, persona, setPersonaId } = usePersona();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <nav className="border-b border-border/60 bg-background/80 px-6 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-semibold tracking-tight">CareNav</div>
          <div className="text-xs text-muted-foreground">
            Clinical & financial triage
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span className="text-muted-foreground">Persona:</span>
              <span className="font-medium">{persona.name}</span>
              <span className="hidden md:inline text-muted-foreground">
                · {persona.insurance_type}
              </span>
              <ChevronDown className="w-4 h-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {personas.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onSelect={() => setPersonaId(p.id)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.insurance_type}
                  </span>
                  {p.id === persona.id && (
                    <Check className="w-4 h-4 ml-auto text-emerald-600" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {p.blurb}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </nav>
  );
};

export default TopNavBar;
