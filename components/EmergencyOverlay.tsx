"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, X } from "lucide-react";

interface EmergencyOverlayProps {
  open: boolean;
  matchedKeyword?: string;
  onDismiss: () => void;
}

export default function EmergencyOverlay({
  open,
  matchedKeyword,
  onDismiss,
}: EmergencyOverlayProps) {
  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Medical emergency warning"
      className="fixed inset-0 z-50 flex items-center justify-center bg-red-700/95 backdrop-blur-sm p-6 animate-in fade-in"
    >
      <div className="max-w-xl w-full text-white text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-12 h-12" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Possible medical emergency
          </h1>
          <p className="text-lg text-white/90">
            Your description includes
            {matchedKeyword ? (
              <>
                {" "}<span className="font-semibold underline">&quot;{matchedKeyword}&quot;</span>
              </>
            ) : (
              " warning signs"
            )}
            . Do not wait. Call emergency services now.
          </p>
        </div>

        <a href="tel:911" className="block">
          <Button
            size="lg"
            className="w-full h-16 text-2xl font-bold bg-white text-red-700 hover:bg-white/90 gap-3"
          >
            <Phone className="w-6 h-6" />
            CALL 911
          </Button>
        </a>

        <div className="text-sm text-white/80 space-y-1">
          <p>If you are with someone unconscious, lay them on their side.</p>
          <p>For severe bleeding, apply firm pressure with a clean cloth.</p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm underline-offset-4 hover:underline"
        >
          <X className="w-4 h-4" />
          I described this incorrectly - dismiss
        </button>
      </div>
    </div>
  );
}
