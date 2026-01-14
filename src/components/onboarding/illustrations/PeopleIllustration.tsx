export function PeopleIllustration() {
  return (
    <svg
      width="200"
      height="120"
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-80"
    >
      {/* Table */}
      <ellipse cx="100" cy="95" rx="70" ry="12" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="30" y1="95" x2="30" y2="115" stroke="currentColor" strokeWidth="1" />
      <line x1="170" y1="95" x2="170" y2="115" stroke="currentColor" strokeWidth="1" />
      
      {/* Person 1 - left */}
      <circle cx="50" cy="55" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M40 75 Q50 85 60 75" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="45" y1="65" x2="42" y2="80" stroke="currentColor" strokeWidth="1" />
      <line x1="55" y1="65" x2="58" y2="80" stroke="currentColor" strokeWidth="1" />
      
      {/* Person 2 - center-left */}
      <circle cx="80" cy="50" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M70 70 Q80 80 90 70" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="75" y1="60" x2="72" y2="75" stroke="currentColor" strokeWidth="1" />
      <line x1="85" y1="60" x2="88" y2="75" stroke="currentColor" strokeWidth="1" />
      
      {/* Person 3 - center-right */}
      <circle cx="120" cy="50" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M110 70 Q120 80 130 70" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="115" y1="60" x2="112" y2="75" stroke="currentColor" strokeWidth="1" />
      <line x1="125" y1="60" x2="128" y2="75" stroke="currentColor" strokeWidth="1" />
      
      {/* Person 4 - right */}
      <circle cx="150" cy="55" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M140 75 Q150 85 160 75" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="145" y1="65" x2="142" y2="80" stroke="currentColor" strokeWidth="1" />
      <line x1="155" y1="65" x2="158" y2="80" stroke="currentColor" strokeWidth="1" />
      
      {/* Cups on table */}
      <rect x="65" y="88" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="95" y="88" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="125" y="88" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}
