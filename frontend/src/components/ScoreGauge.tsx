interface Props {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 180 }: Props) {
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#5cf2a8" : score >= 50 ? "#ffb454" : "#ff5c5c";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1f2b25" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>

      {/* signature scanning beam, clipped to the circle */}
      <div
        className="absolute inset-3 overflow-hidden rounded-full"
        style={{ clipPath: "circle(50% at 50% 50%)" }}
      >
        <div
          className="absolute left-0 right-0 h-1/3 animate-scan"
          style={{
            background: `linear-gradient(to bottom, transparent, ${color}33, transparent)`,
          }}
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-muted">ats score</span>
      </div>
    </div>
  );
}
