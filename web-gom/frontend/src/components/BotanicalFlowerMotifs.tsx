// Pure transparent botanical flower & pottery kiln smoke motifs
export function FlowerNguSacMotif({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lantana / Ngũ Sắc blossom cluster */}
      <g opacity="0.85">
        <circle cx="50" cy="50" r="10" fill="#E2725B" />
        <circle cx="36" cy="40" r="8" fill="#F4A261" />
        <circle cx="64" cy="40" r="8" fill="#E76F51" />
        <circle cx="38" cy="62" r="8.5" fill="#D97706" />
        <circle cx="62" cy="62" r="8.5" fill="#E63946" />
        <circle cx="50" cy="32" r="7" fill="#F3C68F" />
        <circle cx="50" cy="68" r="7.5" fill="#C2410C" />
        <circle cx="28" cy="52" r="6.5" fill="#F59E0B" />
        <circle cx="72" cy="52" r="6.5" fill="#B91C1C" />
        {/* Core dots */}
        <circle cx="50" cy="50" r="3.5" fill="#FEF3C7" />
        <circle cx="36" cy="40" r="2.5" fill="#FEF3C7" />
        <circle cx="64" cy="40" r="2.5" fill="#FEF3C7" />
        <circle cx="38" cy="62" r="2.5" fill="#FEF3C7" />
        <circle cx="62" cy="62" r="2.5" fill="#FEF3C7" />
      </g>
    </svg>
  )
}

export function FlowerTrinhNuMotif({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Mimosa pudica / Trinh Nữ fluffy puff blossom */}
      <g opacity="0.82">
        {/* Stem & tiny leaves */}
        <path d="M50 85 C46 65 50 45 50 20" stroke="#8E9A78" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="40" cy="65" rx="7" ry="2.5" transform="rotate(-30 40 65)" fill="#9AA882" />
        <ellipse cx="60" cy="58" rx="7" ry="2.5" transform="rotate(30 60 58)" fill="#9AA882" />
        {/* Fluffy puff rays */}
        <circle cx="50" cy="30" r="14" fill="#F472B6" fillOpacity="0.45" />
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16
          const rad = (angle * Math.PI) / 180
          const x1 = 50 + Math.cos(rad) * 6
          const y1 = 30 + Math.sin(rad) * 6
          const x2 = 50 + Math.cos(rad) * 22
          const y2 = 30 + Math.sin(rad) * 22
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EC4899" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx={x2} cy={y2} r="1.8" fill="#FDF2F8" />
            </g>
          )
        })}
        <circle cx="50" cy="30" r="5" fill="#DB2777" />
      </g>
    </svg>
  )
}

export function FlowerCucTrangMotif({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* White Daisy / Cúc Trắng */}
      <g opacity="0.88">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12
          return (
            <ellipse
              key={i}
              cx="50"
              cy="25"
              rx="6"
              ry="16"
              transform={`rotate(${angle} 50 50)`}
              fill="#FFFFFF"
              stroke="#D4C3B7"
              strokeWidth="1.2"
            />
          )
        })}
        {/* Core center */}
        <circle cx="50" cy="50" r="11" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="6" fill="#FBBF24" />
      </g>
    </svg>
  )
}

export function FlowerDaQuyMotif({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Wild Sunflower / Dã Quỳ */}
      <g opacity="0.88">
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i * 360) / 14
          return (
            <path
              key={i}
              d="M50 50 C44 32 46 16 50 8 C54 16 56 32 50 50 Z"
              transform={`rotate(${angle} 50 50)`}
              fill="#FBBF24"
              stroke="#D97706"
              strokeWidth="1"
            />
          )
        })}
        {/* Brown / Dark Golden Core */}
        <circle cx="50" cy="50" r="14" fill="#78350F" stroke="#92400E" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="10" fill="#92400E" />
        <circle cx="50" cy="50" r="5" fill="#D97706" />
      </g>
    </svg>
  )
}

export function KilnSmokeRibbonMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      width="140"
      height="220"
      viewBox="0 0 140 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Organic ceramic smoke / swirl ribbon lines matching the reference */}
      <path
        d="M30 210 C70 170 110 130 80 80 C60 45 90 20 110 10"
        stroke="#C4A496"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      <path
        d="M15 190 C50 150 90 110 65 65 C50 35 75 15 95 5"
        stroke="#A56A5B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />
      <path
        d="M45 220 C85 180 120 145 95 95 C80 60 105 35 125 20"
        stroke="#D97706"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.3"
      />
    </svg>
  )
}
