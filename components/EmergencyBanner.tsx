"use client";
import { AlertTriangle, Phone } from "lucide-react";

export default function EmergencyBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <AlertTriangle className="text-white w-24 h-24 mb-6 animate-pulse" />
      <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none">CALL 911 NOW</h1>
      <p className="text-red-100 text-xl md:text-2xl max-w-2xl font-medium mb-4">
        Based on your symptoms, you may be experiencing a life-threatening emergency.
      </p>
      <p className="text-red-200 text-lg mb-10 font-semibold">Do not wait — call 911 or go to the nearest ER immediately.</p>
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <a href="tel:911" className="flex items-center gap-2 bg-white text-red-600 font-black px-8 py-4 rounded-full text-xl shadow-xl hover:bg-red-50 transition-colors">
          <Phone className="w-6 h-6" /> Call 911
        </a>
        <a href="tel:3013147651" className="flex items-center gap-2 bg-red-700 text-white font-bold px-8 py-4 rounded-full text-lg shadow-xl hover:bg-red-800 transition-colors border border-red-400">
          UMD Crisis: 301-314-7651
        </a>
      </div>
      <button onClick={() => { if (confirm("Are you sure you want to dismiss this emergency warning?")) onDismiss(); }}
        className="text-red-300 hover:text-white underline text-sm transition-colors">
        I am safe - continue to triage dashboard anyway
      </button>
    </div>
  );
}
