import { useState, useEffect, useRef } from "react";

type TickerMatch = {
  homeTeam: string;
  homeFlag: string;
  homeScore: number | null;
  awayTeam: string;
  awayFlag: string;
  awayScore: number | null;
  status: "LIVE" | "FT" | "HT" | "upcoming";
  minute?: number;
  kickoffLabel?: string;
};

const BASE_MATCHES: TickerMatch[] = [
  { homeTeam: "Brazil", homeFlag: "🇧🇷", homeScore: 2, awayTeam: "Germany", awayFlag: "🇩🇪", awayScore: 1, status: "LIVE", minute: 67 },
  { homeTeam: "Argentina", homeFlag: "🇦🇷", homeScore: 3, awayTeam: "Saudi Arabia", awayFlag: "🇸🇦", awayScore: 0, status: "FT" },
  { homeTeam: "France", homeFlag: "🇫🇷", homeScore: 1, awayTeam: "Poland", awayFlag: "🇵🇱", awayScore: 1, status: "HT" },
  { homeTeam: "Spain", homeFlag: "🇪🇸", homeScore: null, awayTeam: "England", awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", awayScore: null, status: "upcoming", kickoffLabel: "22:00 UTC" },
  { homeTeam: "Portugal", homeFlag: "🇵🇹", homeScore: 2, awayTeam: "Ghana", awayFlag: "🇬🇭", awayScore: 0, status: "FT" },
  { homeTeam: "USA", homeFlag: "🇺🇸", homeScore: null, awayTeam: "Mexico", awayFlag: "🇲🇽", awayScore: null, status: "upcoming", kickoffLabel: "00:00 UTC" },
  { homeTeam: "Netherlands", homeFlag: "🇳🇱", homeScore: 1, awayTeam: "Ecuador", awayFlag: "🇪🇨", awayScore: 1, status: "FT" },
  { homeTeam: "Japan", homeFlag: "🇯🇵", homeScore: 2, awayTeam: "Costa Rica", awayFlag: "🇨🇷", awayScore: 0, status: "FT" },
  { homeTeam: "Morocco", homeFlag: "🇲🇦", homeScore: null, awayTeam: "Croatia", awayFlag: "🇭🇷", awayScore: null, status: "upcoming", kickoffLabel: "19:00 UTC" },
  { homeTeam: "Australia", homeFlag: "🇦🇺", homeScore: 1, awayTeam: "Tunisia", awayFlag: "🇹🇳", awayScore: 0, status: "FT" },
  { homeTeam: "South Korea", homeFlag: "🇰🇷", homeScore: 2, awayTeam: "Uruguay", awayFlag: "🇺🇾", awayScore: 3, status: "FT" },
  { homeTeam: "Italy", homeFlag: "🇮🇹", homeScore: null, awayTeam: "Cameroon", awayFlag: "🇨🇲", awayScore: null, status: "upcoming", kickoffLabel: "18:00 UTC" },
];

function TickerItem({ match }: { match: TickerMatch }) {
  const statusColor =
    match.status === "LIVE" ? "text-red-400" :
    match.status === "HT" ? "text-yellow-400" :
    match.status === "FT" ? "text-zinc-400" :
    "text-blue-400";

  return (
    <span className="inline-flex items-center gap-2 px-5 border-r border-white/10 whitespace-nowrap text-sm">
      {/* Status */}
      <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor} min-w-[28px]`}>
        {match.status === "LIVE" ? (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            {match.minute}'
          </span>
        ) : match.status === "upcoming" ? (
          <span className="text-zinc-500">{match.kickoffLabel}</span>
        ) : match.status}
      </span>

      {/* Home */}
      <span className="text-base leading-none">{match.homeFlag}</span>
      <span className="text-white font-semibold">{match.homeTeam}</span>

      {/* Score */}
      {match.homeScore !== null && match.awayScore !== null ? (
        <span className="font-black text-white tracking-tight tabular-nums">
          {match.homeScore} – {match.awayScore}
        </span>
      ) : (
        <span className="text-zinc-600 font-bold">vs</span>
      )}

      {/* Away */}
      <span className="text-white font-semibold">{match.awayTeam}</span>
      <span className="text-base leading-none">{match.awayFlag}</span>
    </span>
  );
}

export default function ScoreTicker() {
  const [liveMinute, setLiveMinute] = useState(67);
  const [matches, setMatches] = useState(BASE_MATCHES);
  const trackRef = useRef<HTMLDivElement>(null);

  // Tick the live match minute every 30s (simulated live update)
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveMinute(m => {
        const next = m >= 90 ? 90 : m + 1;
        setMatches(prev =>
          prev.map(m2 =>
            m2.status === "LIVE" ? { ...m2, minute: next } : m2
          )
        );
        return next;
      });
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  // CSS marquee — duplicate content for seamless loop
  const items = [...matches, ...matches];

  return (
    <div
      className="relative w-full bg-zinc-950 border-b border-white/5 overflow-hidden h-9 flex items-center"
      data-testid="score-ticker"
      aria-label="Live score ticker"
    >
      {/* Left label */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 h-full bg-red-600 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          WC 2026
        </span>
      </div>

      {/* Scrolling track */}
      <div className="overflow-hidden flex-1 relative">
        <div
          ref={trackRef}
          className="flex animate-ticker"
          style={{ animationDuration: `${items.length * 4}s` }}
        >
          {items.map((match, i) => (
            <TickerItem key={i} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}
