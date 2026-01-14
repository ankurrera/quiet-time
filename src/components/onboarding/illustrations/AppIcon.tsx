export function AppIcon() {
  return (
    <div className="w-20 h-20 bg-foreground rounded-2xl flex items-center justify-center">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hourglass shape */}
        <path
          d="M10 5 L30 5 L30 8 L25 15 L25 25 L30 32 L30 35 L10 35 L10 32 L15 25 L15 15 L10 8 Z"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        {/* Cross lines in hourglass */}
        <line x1="15" y1="15" x2="25" y2="25" stroke="white" strokeWidth="1.5" />
        <line x1="25" y1="15" x2="15" y2="25" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
