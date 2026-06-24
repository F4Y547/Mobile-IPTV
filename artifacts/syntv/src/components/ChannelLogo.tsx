import { useMemo, useState } from "react";
import { Channel } from "@/data/channels";

interface ChannelLogoProps {
  channel: Channel;
  size?: "sm" | "md" | "lg";
  className?: string;
}

type LogoPalette = {
  from: string;
  to: string;
  glow: string;
  label: string;
};

const CATEGORY_PALETTES: Record<string, LogoPalette> = {
  Sports: { from: "#f97316", to: "#dc2626", glow: "#fed7aa", label: "SPORTS" },
  Kids: { from: "#7c3aed", to: "#2563eb", glow: "#ddd6fe", label: "KIDS" },
  Entertainment: { from: "#0891b2", to: "#0f172a", glow: "#a5f3fc", label: "TV" },
  News: { from: "#991b1b", to: "#ef4444", glow: "#fecaca", label: "NEWS" },
  Documentary: { from: "#065f46", to: "#059669", glow: "#bbf7d0", label: "DOC" },
  Religious: { from: "#92400e", to: "#d97706", glow: "#fde68a", label: "LIVE" },
  Movies: { from: "#6d28d9", to: "#db2777", glow: "#f5d0fe", label: "MOVIE" },
  Music: { from: "#db2777", to: "#7c3aed", glow: "#fbcfe8", label: "MUSIC" },
};

const DEFAULT_PALETTE: LogoPalette = {
  from: "#374151",
  to: "#111827",
  glow: "#e5e7eb",
  label: "LIVE",
};

function getInitials(name: string) {
  const cleaned = name
    .replace(/[🇦-🇿]/gu, " ")
    .replace(/[+&/|_-]/g, " ")
    .replace(/\b(HD|TV|LIVE|ONLINE|CHANNEL|FIFA|2026)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "TV";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function getPalette(category: string) {
  return CATEGORY_PALETTES[category] || DEFAULT_PALETTE;
}

function createGeneratedLogo(channel: Channel) {
  const palette = getPalette(channel.category);
  const initials = getInitials(channel.name);
  const safeName = channel.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${safeName} logo">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.from}"/>
          <stop offset="100%" stop-color="${palette.to}"/>
        </linearGradient>
        <radialGradient id="shine" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.55"/>
          <stop offset="70%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <rect width="200" height="200" rx="46" fill="url(#bg)"/>
      <rect width="200" height="200" rx="46" fill="url(#shine)"/>
      <circle cx="152" cy="45" r="18" fill="#ffffff" opacity="0.16"/>
      <circle cx="166" cy="63" r="8" fill="#ffffff" opacity="0.18"/>
      <rect x="32" y="34" width="136" height="98" rx="22" fill="#020617" opacity="0.38" filter="url(#shadow)"/>
      <rect x="44" y="46" width="112" height="70" rx="14" fill="#ffffff" opacity="0.10"/>
      <path d="M78 151h44" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.85"/>
      <path d="M100 130v21" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.85"/>
      <text x="100" y="95" text-anchor="middle" dominant-baseline="middle" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="900" fill="#ffffff" letter-spacing="-2">${initials}</text>
      <rect x="43" y="150" width="114" height="24" rx="12" fill="#020617" opacity="0.42"/>
      <text x="100" y="167" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="900" fill="#ffffff" letter-spacing="2">${palette.label}</text>
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function ChannelLogo({ channel, size = "md", className = "" }: ChannelLogoProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const generatedLogo = useMemo(() => createGeneratedLogo(channel), [channel]);
  const logoUrl = channel.logoUrl && !logoFailed ? channel.logoUrl : generatedLogo;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-20 h-20 md:w-24 md:h-24",
  };

  return (
    <div className={`overflow-hidden rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/10 shadow-inner ${sizeClasses[size]} ${className}`}>
      <img
        src={logoUrl}
        alt={`${channel.name} logo`}
        className="h-full w-full object-contain p-1.5"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setLogoFailed(true)}
      />
    </div>
  );
}
