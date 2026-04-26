"use client";

import { AlertTriangle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmergencyOverlay({
  phrase,
  onDismiss,
}: {
  phrase: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-danger/95 px-4 py-8 backdrop-blur-sm animate-in fade-in"
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss emergency warning"
        className="absolute right-4 top-4 rounded-full p-2 text-danger-foreground/80 transition hover:bg-white/10 hover:text-danger-foreground"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="max-w-xl text-center text-danger-foreground">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          Medical emergency detected
        </div>

        <h1
          id="emergency-title"
          className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Call 911 right now.
        </h1>

        <p className="mt-4 text-base leading-relaxed text-danger-foreground/90 sm:text-lg">
          We noticed the phrase{" "}
          <span className="font-semibold underline decoration-white/40 underline-offset-4">
            &quot;{phrase}&quot;
          </span>
          . This may be a life-threatening situation. Do not wait for an app
          recommendation. Call emergency services or get to the nearest ER
          immediately.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 w-full gap-2 bg-white text-danger hover:bg-white/90 sm:w-auto"
          >
            <a href="tel:911">
              <Phone className="h-5 w-5" />
              Call 911
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onDismiss}
            className="h-12 w-full border-white/40 bg-transparent text-danger-foreground hover:bg-white/10 hover:text-danger-foreground sm:w-auto"
          >
            This was a mistake
          </Button>
        </div>

        <p className="mt-6 text-xs text-danger-foreground/75">
          CareNav is not a substitute for emergency medical care.
        </p>
      </div>
    </div>
  );
}
