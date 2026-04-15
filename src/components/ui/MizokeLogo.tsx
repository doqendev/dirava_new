interface MizokeLogoProps {
  className?: string
}

export function MizokeLogo({ className }: MizokeLogoProps) {
  return (
    <svg
      viewBox="0 0 240 46"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Mizoke"
      role="img"
    >
      <defs>
        <filter id="neonCyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="b1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="b2" />
          <feMerge>
            <feMergeNode in="b1" />
            <feMergeNode in="b2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <text
        x="120"
        y="23"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-orbitron), 'Orbitron', sans-serif"
        fontWeight="900"
        fontSize="44"
        fill="#22d3ee"
        filter="url(#neonCyan)"
        letterSpacing="4"
      >
        MIZOKE
      </text>
      <text
        x="120"
        y="23"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-orbitron), 'Orbitron', sans-serif"
        fontWeight="900"
        fontSize="44"
        fill="#f0fdff"
        letterSpacing="4"
      >
        MIZOKE
      </text>
    </svg>
  )
}
