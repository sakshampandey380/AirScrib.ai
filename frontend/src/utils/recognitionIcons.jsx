export function RecognitionIcon({ label, className = "h-12 w-12" }) {
  const stroke = "url(#airGradient)";

  const icon = {
    circle: <circle cx="24" cy="24" r="14" fill="none" stroke={stroke} strokeWidth="3" />,
    square: <rect x="11" y="11" width="26" height="26" rx="4" fill="none" stroke={stroke} strokeWidth="3" />,
    triangle: <path d="M24 10 L38 36 H10 Z" fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />,
    heart: <path d="M24 38S10 30 10 19a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 19-14 19Z" fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />,
    star: <path d="m24 8 4.6 9.2 10.2 1.5-7.4 7.2 1.8 10.1L24 31l-9.2 5 1.8-10.1-7.4-7.2 10.2-1.5Z" fill="none" stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />,
    arrow: <path d="M10 24h22M24 14l10 10-10 10" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    house: <path d="M12 22 24 12l12 10v14H12Z" fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />,
    tree: <path d="M24 11 11 28h8v10h10V28h8Z" fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />,
    sun: (
      <>
        <circle cx="24" cy="24" r="9" fill="none" stroke={stroke} strokeWidth="3" />
        <path d="M24 7v6M24 35v6M7 24h6M35 24h6M12 12l4 4M32 32l4 4M12 36l4-4M32 16l4-4" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
    face: (
      <>
        <circle cx="24" cy="24" r="14" fill="none" stroke={stroke} strokeWidth="3" />
        <circle cx="19" cy="20" r="1.5" fill="#82f0ff" />
        <circle cx="29" cy="20" r="1.5" fill="#82f0ff" />
        <path d="M18 28c1.8 2.2 4 3.2 6 3.2s4.2-1 6-3.2" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
    car: <path d="M11 28h26l-3-9H15l-4 9Zm5 4a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />,
  }[label] ?? <circle cx="24" cy="24" r="12" fill="none" stroke={stroke} strokeWidth="3" />;

  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <defs>
        <linearGradient id="airGradient" x1="5" y1="5" x2="43" y2="43">
          <stop offset="0%" stopColor="#23d3ff" />
          <stop offset="100%" stopColor="#d93eff" />
        </linearGradient>
      </defs>
      {icon}
    </svg>
  );
}

