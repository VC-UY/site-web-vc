import { theme } from "@/lib/theme";

export function Logo({ size = 48 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, rgba(0, 212, 255, 0.25) 0%, rgba(0, 180, 240, 0.15) 100%)",
        border: "2px solid rgba(0, 212, 255, 0.4)",
        boxShadow: theme.glow,
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="#00D4FF" strokeWidth="2" />
        <circle cx="12" cy="5" r="2" fill="#00D4FF" />
        <circle cx="12" cy="19" r="2" fill="#00D4FF" />
        <circle cx="5" cy="12" r="2" fill="#00B0F0" />
        <circle cx="19" cy="12" r="2" fill="#00B0F0" />
      </svg>
    </div>
  );
}
