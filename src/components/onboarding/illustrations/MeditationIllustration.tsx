export function MeditationIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-80"
    >
      {/* Person meditating */}
      <circle cx="80" cy="35" r="12" stroke="currentColor" strokeWidth="1" fill="none" />
      
      {/* Body in meditation pose */}
      <path 
        d="M68 50 Q80 55 92 50" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none" 
      />
      <path 
        d="M55 85 Q80 75 105 85" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none" 
      />
      
      {/* Crossed legs */}
      <path 
        d="M60 85 Q70 95 80 90 Q90 95 100 85" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none" 
      />
      
      {/* Arms */}
      <path 
        d="M68 55 Q55 70 60 85" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none" 
      />
      <path 
        d="M92 55 Q105 70 100 85" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none" 
      />
      
      {/* Lightbulb above head */}
      <ellipse cx="100" cy="15" rx="8" ry="10" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="96" y1="25" x2="104" y2="25" stroke="currentColor" strokeWidth="1" />
      <line x1="97" y1="28" x2="103" y2="28" stroke="currentColor" strokeWidth="1" />
      
      {/* Light rays */}
      <line x1="100" y1="2" x2="100" y2="5" stroke="currentColor" strokeWidth="1" />
      <line x1="112" y1="8" x2="115" y2="5" stroke="currentColor" strokeWidth="1" />
      <line x1="88" y1="8" x2="85" y2="5" stroke="currentColor" strokeWidth="1" />
      
      {/* Ground plants */}
      <path d="M30 100 Q35 90 32 80" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M35 100 Q38 92 36 85" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M125 100 Q130 90 127 80" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M130 100 Q133 92 131 85" stroke="currentColor" strokeWidth="1" fill="none" />
      
      {/* Small pot */}
      <rect x="120" y="100" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}
