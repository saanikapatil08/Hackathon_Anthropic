import { Stethoscope, Hospital, Video } from "lucide-react";

export function HeroVisual() {
  const segments = [
    { label: "Telehealth", value: 52, color: "hsl(var(--success))", icon: Video },
    { label: "Urgent Care", value: 33, color: "hsl(var(--primary))", icon: Stethoscope },
    { label: "Emergency Room", value: 15, color: "hsl(var(--danger))", icon: Hospital },
  ];

  const total = segments.reduce((s, x) => s + x.value, 0);
  const radius = 70;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="relative aspect-square rounded-3xl border border-border/70 bg-gradient-surface p-6 shadow-soft">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
            opacity={0.35}
          />
          {segments.map((seg) => {
            const length = (seg.value / total) * circumference;
            const dasharray = `${length} ${circumference - length}`;
            const dashoffset = -offset;
            offset += length;
            return (
              <circle
                key={seg.label}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Avg savings
          </div>
          <div className="font-display text-4xl font-semibold tracking-tight text-foreground">
            68%
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            vs. default ER visit
          </div>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2">
        {segments.map(({ label, value, color, icon: Icon }) => (
          <li
            key={label}
            className="rounded-xl border border-border/70 bg-card p-2.5 text-center shadow-soft"
          >
            <div className="flex items-center justify-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: color }}
                aria-hidden
              />
              <Icon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">{value}%</div>
            <div className="text-[10px] leading-tight text-muted-foreground">{label}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
