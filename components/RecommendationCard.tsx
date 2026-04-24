import { Recommendation } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock, MapPin, DollarSign, Stethoscope, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  const accentMap = { green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-red-500" };
  const badgeBgMap = { green: "bg-emerald-600", yellow: "bg-amber-600", red: "bg-red-600" };
  const isClosed = rec.availability.toLowerCase().includes("closed");

  let costColor = "text-slate-700";
  const costMatch = rec.estimated_cost.match(/\$(\d+)/);
  if (costMatch) {
    const amount = parseInt(costMatch[1]);
    if (amount === 0) costColor = "text-emerald-600 font-bold";
    else if (amount < 100) costColor = "text-emerald-600 font-bold";
    else if (amount <= 500) costColor = "text-amber-600 font-bold";
    else costColor = "text-red-600 font-bold";
  }
  if (rec.estimated_cost.includes("$0")) costColor = "text-emerald-600 font-bold";

  const icon = rec.facility_type === "Emergency Room"
    ? <AlertCircle className="w-6 h-6 text-red-500" />
    : rec.facility_type === "Telehealth"
    ? <Stethoscope className="w-6 h-6 text-blue-500" />
    : <Building2 className="w-6 h-6 text-emerald-600" />;

  return (
    <Card className={cn("relative overflow-hidden flex flex-col h-full bg-white shadow-sm border-slate-200 transition-all hover:shadow-md", rec.status === "not_recommended" && "opacity-70")}>
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", accentMap[rec.color])} />
      <div className="absolute top-3 right-3 text-5xl font-black text-slate-100 select-none leading-none">{rec.rank}</div>
      <div className="p-6 pl-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <Badge className={cn("text-xs font-bold px-3 py-1 text-white border-0", badgeBgMap[rec.color])}>{rec.badge}</Badge>
          {icon}
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-5 leading-tight pr-6">{rec.facility_name}</h3>
        <div className="space-y-3 mb-5 flex-1">
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
            <span className={cn("text-sm", costColor)}>{rec.estimated_cost}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-sm font-medium text-slate-600">{rec.wait_time}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className={cn("text-sm font-medium", isClosed ? "text-red-500" : "text-slate-600")}>{rec.availability}</span>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-auto">
          <p className="text-sm text-slate-700 leading-relaxed">{rec.reasoning}</p>
        </div>
      </div>
    </Card>
  );
}
