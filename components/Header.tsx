import { HeartPulse } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <HeartPulse className="text-blue-600 w-8 h-8" />
        <div>
          <h1 className="font-black text-xl tracking-tight text-slate-900 leading-none">CareNav</h1>
          <p className="text-xs text-slate-400 font-medium">UMD Health Triage</p>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500 hidden sm:block">
        Know where to go. Know what it&apos;ll cost.
      </p>
    </header>
  );
}
