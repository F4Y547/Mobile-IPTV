import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Play, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

type Match = {
  id: string;
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
  kickoff: Date;
  venue: string;
  city: string;
  stage: string;
  isLive?: boolean;
};

const MATCHES: Match[] = [
  { id: "m1", homeTeam: "Brazil", homeFlag: "🇧🇷", awayTeam: "Germany", awayFlag: "🇩🇪", kickoff: new Date("2026-06-23T18:00:00Z"), venue: "MetLife Stadium", city: "New York", stage: "Group F", isLive: true },
  { id: "m2", homeTeam: "Argentina", homeFlag: "🇦🇷", awayTeam: "France", awayFlag: "🇫🇷", kickoff: new Date("2026-06-23T22:00:00Z"), venue: "SoFi Stadium", city: "Los Angeles", stage: "Group C" },
  { id: "m3", homeTeam: "England", homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", awayTeam: "Spain", awayFlag: "🇪🇸", kickoff: new Date("2026-06-24T15:00:00Z"), venue: "AT&T Stadium", city: "Dallas", stage: "Group B" },
  { id: "m4", homeTeam: "Portugal", homeFlag: "🇵🇹", awayTeam: "Morocco", awayFlag: "🇲🇦", kickoff: new Date("2026-06-24T19:00:00Z"), venue: "Estadio Azteca", city: "Mexico City", stage: "Group H" },
  { id: "m5", homeTeam: "Netherlands", homeFlag: "🇳🇱", awayTeam: "Japan", awayFlag: "🇯🇵", kickoff: new Date("2026-06-24T23:00:00Z"), venue: "BC Place", city: "Vancouver", stage: "Group D" },
  { id: "m6", homeTeam: "USA", homeFlag: "🇺🇸", awayTeam: "Mexico", awayFlag: "🇲🇽", kickoff: new Date("2026-06-25T00:00:00Z"), venue: "Rose Bowl", city: "Pasadena", stage: "Group A" },
  { id: "m7", homeTeam: "Italy", homeFlag: "🇮🇹", awayTeam: "Croatia", awayFlag: "🇭🇷", kickoff: new Date("2026-06-25T18:00:00Z"), venue: "Lumen Field", city: "Seattle", stage: "Group E" },
  { id: "m8", homeTeam: "Australia", homeFlag: "🇦🇺", awayTeam: "South Korea", awayFlag: "🇰🇷", kickoff: new Date("2026-06-26T15:00:00Z"), venue: "BMO Field", city: "Toronto", stage: "Group G" },
];

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function getCountdown(kickoff: Date): Countdown | null {
  const diff = kickoff.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function formatKickoff(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
    " · " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
}

function MatchCard({ match }: { match: Match }) {
  const [countdown, setCountdown] = useState<Countdown | null>(getCountdown(match.kickoff));

  useEffect(() => {
    if (match.isLive) return;
    const interval = setInterval(() => setCountdown(getCountdown(match.kickoff)), 1000);
    return () => clearInterval(interval);
  }, [match.kickoff, match.isLive]);

  return (
    <div
      className="flex-shrink-0 w-[240px] sm:w-72 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3 sm:p-4 hover:border-red-600/50 hover:bg-white/8 transition-all duration-200 group"
      data-testid={`match-card-${match.id}`}
    >
      {/* Stage + Live badge */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">{match.stage}</span>
        {match.isLive ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </span>
        ) : (
          <span className="text-[10px] sm:text-xs text-zinc-500 truncate max-w-[120px]">{formatKickoff(match.kickoff)}</span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-2xl sm:text-3xl">{match.homeFlag}</span>
          <span className="text-[10px] sm:text-xs font-bold text-white text-center leading-tight">{match.homeTeam}</span>
        </div>

        <div className="flex flex-col items-center px-2 sm:px-3">
          {match.isLive ? (
            <span className="text-red-400 font-black text-base sm:text-lg">LIVE</span>
          ) : (
            <span className="text-zinc-400 font-bold text-xs sm:text-sm">VS</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-2xl sm:text-3xl">{match.awayFlag}</span>
          <span className="text-[10px] sm:text-xs font-bold text-white text-center leading-tight">{match.awayTeam}</span>
        </div>
      </div>

      {/* Countdown or venue */}
      {match.isLive ? (
        <Link href="/watch/fifa-wc-2026">
          <button
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all"
            data-testid={`watch-match-${match.id}`}
          >
            <Play className="w-3 h-3 fill-current" />
            Watch Live
          </button>
        </Link>
      ) : countdown ? (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1 text-center">
            {[
              { val: countdown.days, label: "D" },
              { val: countdown.hours, label: "H" },
              { val: countdown.minutes, label: "M" },
              { val: countdown.seconds, label: "S" },
            ].map(({ val, label }) => (
              <div key={label} className="bg-black/40 rounded-md py-1">
                <p className="text-white font-black text-xs sm:text-sm tabular-nums">{String(val).padStart(2, "0")}</p>
                <p className="text-zinc-600 text-[9px] uppercase">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{match.venue}, {match.city}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
          <Clock className="w-2.5 h-2.5" />
          <span>Starting soon</span>
        </div>
      )}
    </div>
  );
}

export default function MatchScheduleBanner() {
  const scroll = (dir: "left" | "right") => {
    const el = document.getElementById("match-scroll");
    if (el) el.scrollBy({ left: dir === "right" ? 260 : -260, behavior: "smooth" });
  };

  return (
    <div className="relative z-20 bg-gradient-to-r from-black via-zinc-950 to-black border-y border-white/5 py-4 sm:py-5" data-testid="match-schedule-banner">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-16 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-base sm:text-lg">🏆</span>
          <div>
            <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider">FIFA World Cup 2026</h3>
            <p className="text-zinc-500 text-[10px] sm:text-xs">Match Schedule · Group Stage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
            data-testid="schedule-scroll-left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
            data-testid="schedule-scroll-right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable match cards */}
      <div
        id="match-scroll"
        className="flex gap-3 px-4 md:px-16 overflow-x-auto scrollbar-hide pb-1"
      >
        {MATCHES.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
