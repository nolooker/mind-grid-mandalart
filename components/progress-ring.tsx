interface ProgressRingProps { value: number; label: string; size?: "small" | "large"; }
export function ProgressRing({ value, label, size = "small" }: ProgressRingProps) {
  return <div className={`progress-ring ${size}`} style={{ "--progress": `${value * 3.6}deg` } as React.CSSProperties} aria-label={`${label} ${value}%`}><div><strong>{value}%</strong><span>{label}</span></div></div>;
}
