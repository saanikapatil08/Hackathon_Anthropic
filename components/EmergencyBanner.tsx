"use client";

import { useState } from "react";
import { AlertTriangle, Phone } from "lucide-react";

interface Props {
  onDismiss?: () => void;
}

export default function EmergencyBanner({ onDismiss }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    if (confirm("Are you sure you want to dismiss this emergency alert? Only do this if you are safe.")) {
      setDismissed(true);
      onDismiss?.();
    }
  };

  return (
    <div className="w-full rounded-xl bg-red-600 text-white p-6 mb-6 shadow-lg border-2 border-red-400 animate-pulse-once">
      <div className="flex items-start gap-4">
        <AlertTriangle className="h-8 w-8 shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <h2 className="text-xl font-black tracking-tight mb-1">
            EMERGENCY DETECTED
          </h2>
          <p className="text-red-100 text-sm mb-4">
            Based on your symptoms, you may be experiencing a life-threatening emergency.
            Do not wait &mdash; seek immediate help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:911"
              className="flex items-center justify-center gap-2 bg-white text-red-600 font-bold px-5 py-2.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call 911 Now
            </a>
            <a
              href="tel:3013147651"
              className="flex items-center justify-center gap-2 bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-red-800 transition-colors"
            >
              <Phone className="w-4 h-4" />
              UMD Crisis Line: 301-314-7651
            </a>
          </div>
        </div>
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={handleDismiss}
          className="text-red-300 hover:text-white underline text-xs transition-colors"
        >
          I am safe &mdash; continue to triage dashboard anyway
        </button>
      </div>
    </div>
  );
}
