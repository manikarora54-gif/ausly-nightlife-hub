/**
 * Reusable decorative SVG shapes for visual depth across sections.
 */

export const GlowOrb = ({
  color = "primary",
  size = 400,
  className = "",
}: {
  color?: "primary" | "secondary" | "accent";
  size?: number;
  className?: string;
}) => {
  const colorMap = {
    primary: "bg-primary/8",
    secondary: "bg-secondary/6",
    accent: "bg-accent/5",
  };

  return (
    <div
      className={`absolute rounded-full blur-[120px] pointer-events-none ${colorMap[color]} ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export const GridPattern = ({ className = "" }: { className?: string }) => (
  <div
    className={`absolute inset-0 opacity-[0.03] pointer-events-none ${className}`}
    style={{
      backgroundImage:
        "linear-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.4) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
    }}
  />
);

export const DotPattern = ({ className = "" }: { className?: string }) => (
  <div
    className={`absolute opacity-[0.06] pointer-events-none ${className}`}
    style={{
      backgroundImage: "radial-gradient(hsl(var(--primary) / 0.8) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    }}
  />
);

export const DiagonalLines = ({ className = "" }: { className?: string }) => (
  <svg
    className={`absolute pointer-events-none opacity-[0.04] ${className}`}
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="diag" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="20" stroke="hsl(var(--primary))" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diag)" />
  </svg>
);

export const FloatingParticles = ({ count = 6 }: { count?: number }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary/30 animate-float"
        style={{
          top: `${15 + Math.random() * 70}%`,
          left: `${10 + Math.random() * 80}%`,
          animationDelay: `${i * -1.2}s`,
          animationDuration: `${4 + Math.random() * 4}s`,
        }}
      />
    ))}
  </div>
);

export const GradientDivider = () => (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
);
