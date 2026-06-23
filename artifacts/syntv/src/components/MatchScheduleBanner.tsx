import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Play, Clock, MapPin, ChevronLeft, ChevronRight, RefreshCw, Wifi } from "lucide-react";

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
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  isLive?: boolean;
};

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

type WorldCupApiMatch = Record<string, unknown>;

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const WORLD_CUP_API_URL = env.VITE_WORLDCUP_API_URL || "https://worldcup26.ir/get/games";
const WORLD_CUP_API_KEY = env.VITE_WORLDCUP_API_KEY || "";
const MATCH_REFRESH_INTERVAL = 60_000;

const FLAG_BY_TEAM: Record<string, string> = {
  algeria: "🇩🇿",
  argentina: "🇦🇷",
  australia: "🇦🇺",
  austria: "🇦🇹",
  belgium: "🇧🇪",
  brazil: "🇧🇷",
  canada: "🇨🇦",
  colombia: "🇨🇴",
  croatia: "🇭🇷",
  czechia: "🇨🇿",
  ecuador: "🇪🇨",
  egypt: "🇪🇬",
  england: "🏴",
  france: "🇫🇷",
  germany: "🇩🇪",
  ghana: "🇬🇭",
  haiti: "🇭🇹",
  iran: "🇮🇷",
  iraq: "🇮🇶",
  japan: "🇯🇵",
  jordan: "🇯🇴",
  mexico: "🇲🇽",
  morocco: "🇲🇦",
  netherlands: "🇳🇱",
  norway: "🇳🇴",
  panama: "🇵🇦",
  paraguay: "🇵🇾",
  portugal: "🇵🇹",
  qatar: "🇶🇦",
  scotland: "🏴",
  senegal: "🇸🇳",
  "south africa": "🇿🇦",
  "south korea": "🇰🇷",
  spain: "🇪🇸",
  sweden: "🇸🇪",
  switzerland: "🇨🇭",
  tunisia: "🇹🇳",
  turkey: "🇹🇷",
  "united states": "🇺🇸",
  usa: "🇺🇸",
  uruguay: "🇺🇾",
  uzbekistan: "🇺🇿",
};

const FALLBACK_MATCHES: Match[] = [
  { id: "m1", homeTeam: "Brazil", homeFlag: "🇧🇷", awayTeam: "Germany", awayFlag: "🇩🇪", kickoff: new Date("2026-06-23T18:00:00Z"), venue: "MetLife Stadium", city: "New York", stage: "Group Stage", isLive: true, status: "Live" },
  { id: "m2", homeTeam: "Argentina", homeFlag: "🇦🇷", awayTeam: "France", awayFlag: "🇫🇷", kickoff: new Date("2026-06-23T22:00:00Z"), venue: "SoFi Stadium", city: "Los Angeles", stage: "Group Stage" },
  { id: "m3", homeTeam: "England", homeFlag: "🏴", awayTeam: "Spain", awayFlag: "🇪🇸", kickoff: new Date("2026-06-24T15:00:00Z"), venue: "AT&T Stadium", city: "Dallas", stage: "Group Stage" },
  { id: "m4", homeTeam: "Portugal", homeFlag: "🇵🇹", awayTeam: "Morocco", awayFlag: "🇲🇦", kickoff: new Date("2026-06-24T19:00:00Z"), venue: "Estadio Azteca", city: "Mexico City", stage: "Group Stage" },
  { id: "m5", homeTeam: "Netherlands", homeFlag: "🇳🇱", awayTeam: "Japan", awayFlag: "🇯🇵", kickoff: new Date("2026-06-24T23:00:00Z"), venue: "BC Place", city: "Vancouver", stage: "Group Stage" },
  { id: "m6", homeTeam: "USA", homeFlag: "🇺🇸", awayTeam: "Mexico", awayFlag: "🇲🇽", kickoff: new Date("2026-06-25T00:00:00Z"), venue: "Rose Bowl", city: "Pasadena", stage: "Group Stage" },
  { id: "m7", homeTeam: "Italy", homeFlag: "🇮🇹", awayTeam: "Croatia", awayFlag: "🇭🇷", kickoff: new Date("2026-06-25T18:00:00Z"), venue: "Lumen Field", city: "Seattle", stage: "Group Stage" },
  { id: "m8", homeTeam: "Australia", homeFlag: "🇦🇺", awayTeam: "South Korea", awayFlag: "🇰🇷", kickoff: new Date("2026-06-26T15:00:00Z"), venue: "BMO Field", city: "Toronto", stage: "Group Stage" },
];

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return null;
}

function getNestedString(item: WorldCupApiMatch, paths: string[][]): string | undefined {
  for (const path of paths) {
    let value: unknown = item;
    for (const key of path) {
      value = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
    }
    const text = getString(value);
    if (text) return text;
  }
  return undefined;
}

function getNestedNumber(item: WorldCupApiMatch, paths: string[][]): number | null {
  for (const path of paths) {
    let value: unknown = item;
    for (const key of path) {
      value = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
    }
    const number = getNumber(value);
    if (number !== null) return number;
  }
  return null;
}

function getTeamFlag(teamName: string, fallback?: string): string {
  const normalized = teamName.toLowerCase().replace(/\s+/g, " ").trim();
  return fallback || FLAG_BY_TEAM[normalized] || "🏳️";
}

function getMatchDate(item: WorldCupApiMatch): Date {
  const dateText = getNestedString(item, [
    ["kickoff"],
    ["kickoff_time"],
    ["date"],
    ["datetime"],
    ["time"],
    ["start_time"],
    ["scheduled_at"],
  ]);

  const parsed = dateText ? new Date(dateText) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
}

function isMatchLive(status?: string): boolean {
  return /live|in.?progress|playing|1st|2nd|halftime/i.test(status || "");
}

function normalizeMatch(item: WorldCupApiMatch, index: number): Match | null {
  const homeTeam = getNestedString(item, [
    ["homeTeam"],
    ["home_team"],
    ["home", "name"],
    ["home"],
    ["team1"],
    ["team_1", "name"],
    ["team_1"],
  ]);
  const awayTeam = getNestedString(item, [
    ["awayTeam"],
    ["away_team"],
    ["away", "name"],
    ["away"],
    ["team2"],
    ["team_2", "name"],
    ["team_2"],
  ]);

  if (!homeTeam || !awayTeam) return null;

  const status = getNestedString(item, [["status"], ["match_status"], ["state"]]) || "Scheduled";
  const venue = getNestedString(item, [["venue"], ["stadium"], ["stadium", "name"]]) || "FIFA World Cup Stadium";
  const city = getNestedString(item, [["city"], ["location"], ["stadium", "city"]]) || "2026 Host City";
  const stage = getNestedString(item, [["stage"], ["round"], ["group"], ["group_name"]]) || "FIFA World Cup 2026";
  const homeFlag = getTeamFlag(homeTeam, getNestedString(item, [["homeFlag"], ["home_flag"], ["home", "flag"]]));
  const awayFlag = getTeamFlag(awayTeam, getNestedString(item, [["awayFlag"], ["away_flag"], ["away", "flag"]]));

  return {
    id: getNestedString(item, [["id"], ["match_id"], ["game_id"]]) || `api-match-${index}`,
    homeTeam,
    homeFlag,
    awayTeam,
    awayFlag,
    kickoff: getMatchDate(item),
    venue,
    city,
    stage,
    status,
    homeScore: getNestedNumber(item, [["homeScore"], ["home_score"], ["score", "home"], ["home", "score"]]),
    awayScore: getNestedNumber(item, [["awayScore"], ["away_score"], ["score", "away"], ["away", "score"]]),
    isLive: isMatchLive(status),
  };
}

function normalizeApiResponse(payload: unknown): Match[] {
  const possibleMatches = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? (payload as Record<string, unknown>).games ||
        (payload as Record<string, unknown>).matches ||
        (payload as Record<string, unknown>).data ||
        (payload as Record<string, unknown>).results
      : [];

  if (!Array.isArray(possibleMatches)) return [];

  return possibleMatches
    .map((item, index) => normalizeMatch(item as WorldCupApiMatch, index))
    .filter((match): match is Match => Boolean(match))
    .sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return a.kickoff.getTime() - b.kickoff.getTime();
    });
}

async function fetchWorldCupMatches(): Promise<Match[]> {
  const headers: HeadersInit = { Accept: "application/json" };

  if (WORLD_CUP_API_KEY) {
    headers.Authorization = `Bearer ${WORLD_CUP_API_KEY}`;
    headers["x-api-key"] = WORLD_CUP_API_KEY;
  }

  const response = await fetch(WORLD_CUP_API_URL, { headers });
  if (!response.ok) {
    throw new Error(`World Cup API failed with ${response.status}`);
  }

  const payload = await response.json();
  return normalizeApiResponse(payload);
}

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
  const hasScore = match.homeScore !== null && match.homeScore !== undefined && match.awayScore !== null && match.awayScore !== undefined;

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
        <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold truncate max-w-[130px]">{match.stage}</span>
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
          {hasScore ? (
            <span className="text-white font-black text-lg sm:text-xl tabular-nums">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : match.isLive ? (
            <span className="text-red-400 font-black text-base sm:text-lg">LIVE</span>
          ) : (
            <span className="text-zinc-400 font-bold text-xs sm:text-sm">VS</span>
          )}
          {match.status && <span className="mt-1 text-[9px] text-zinc-600 uppercase tracking-wider">{match.status}</span>}
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
  const [matches, setMatches] = useState<Match[]>(FALLBACK_MATCHES);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMatches() {
      try {
        const liveMatches = await fetchWorldCupMatches();
        if (!isMounted) return;

        if (liveMatches.length > 0) {
          setMatches(liveMatches);
          setApiError(null);
          setLastUpdated(new Date());
        } else {
          setApiError("API returned no matches. Showing fallback schedule.");
        }
      } catch (error) {
        if (!isMounted) return;
        setApiError(error instanceof Error ? error.message : "Unable to load live match data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMatches();
    const interval = window.setInterval(loadMatches, MATCH_REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

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
            <div className="flex items-center gap-2">
              <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider">FIFA World Cup 2026</h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                <Wifi className="h-2.5 w-2.5" />
                API Live
              </span>
            </div>
            <p className="text-zinc-500 text-[10px] sm:text-xs">
              All Match Updates · Auto-refresh every 60s
              {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
            </p>
            {apiError && <p className="mt-1 text-[10px] text-amber-400">{apiError}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-zinc-500" />}
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
        {matches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
