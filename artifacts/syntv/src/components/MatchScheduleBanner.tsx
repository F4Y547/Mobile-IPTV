import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Play, Clock, MapPin, ChevronLeft, ChevronRight, RefreshCw, Wifi, AlertTriangle } from "lucide-react";

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

type ApiObject = Record<string, unknown>;
type Countdown = { days: number; hours: number; minutes: number; seconds: number };

type ApiDiagnostics = {
  gamesCount?: number;
  teamsCount?: number;
  stadiumsCount?: number;
  groupsCount?: number;
  gameKeys?: string[];
  teamKeys?: string[];
  stadiumKeys?: string[];
  groupKeys?: string[];
};

type WorldCupPayload = {
  games?: unknown;
  teams?: unknown;
  stadiums?: unknown;
  groups?: unknown;
  matches?: unknown;
  data?: unknown;
  results?: unknown;
  updatedAt?: string;
  errors?: string[];
  diagnostics?: ApiDiagnostics;
};

const MATCH_REFRESH_INTERVAL = 60_000;
const WORLD_CUP_API_URL = "/api/worldcup";

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
  usa: "🇺🇸",
  "united states": "🇺🇸",
  uruguay: "🇺🇾",
  uzbekistan: "🇺🇿",
};

function getString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return null;
}

function asArray(value: unknown): ApiObject[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is ApiObject => Boolean(item) && typeof item === "object");
  }

  if (!value || typeof value !== "object") return [];

  const record = value as ApiObject;
  for (const key of ["games", "matches", "data", "results", "items", "teams", "stadiums", "groups"]) {
    if (Array.isArray(record[key])) return asArray(record[key]);
  }

  return [];
}

function getNestedValue(item: ApiObject, paths: string[][]): unknown {
  for (const path of paths) {
    let current: unknown = item;
    for (const key of path) {
      current = current && typeof current === "object" ? (current as ApiObject)[key] : undefined;
    }
    if (current !== undefined && current !== null && current !== "") return current;
  }
  return undefined;
}

function getNestedString(item: ApiObject, paths: string[][]): string | undefined {
  return getString(getNestedValue(item, paths));
}

function getNestedNumber(item: ApiObject, paths: string[][]): number | null {
  return getNumber(getNestedValue(item, paths));
}

function entityId(item: ApiObject): string | undefined {
  return getNestedString(item, [["id"], ["team_id"], ["stadium_id"], ["group_id"], ["code"], ["slug"]]);
}

function entityName(item: ApiObject): string | undefined {
  return getNestedString(item, [
    ["name"],
    ["name_en"],
    ["title"],
    ["team_name"],
    ["country"],
    ["country_name"],
    ["stadium_name"],
    ["group_name"],
  ]);
}

function buildLookup(collection: unknown): Record<string, ApiObject> {
  const lookup: Record<string, ApiObject> = {};
  for (const item of asArray(collection)) {
    const id = entityId(item);
    const name = entityName(item);
    if (id) lookup[id] = item;
    if (name) lookup[name.toLowerCase()] = item;
  }
  return lookup;
}

function resolveName(value: unknown, lookup: Record<string, ApiObject>, fallback = "TBD"): string {
  if (value && typeof value === "object") {
    return entityName(value as ApiObject) || fallback;
  }

  const raw = getString(value);
  if (!raw) return fallback;
  const found = lookup[raw] || lookup[raw.toLowerCase()];
  return found ? entityName(found) || raw : raw;
}

function resolveField(value: unknown, lookup: Record<string, ApiObject>, paths: string[][]): string | undefined {
  if (value && typeof value === "object") return getNestedString(value as ApiObject, paths);
  const raw = getString(value);
  if (!raw) return undefined;
  const found = lookup[raw] || lookup[raw.toLowerCase()];
  return found ? getNestedString(found, paths) : undefined;
}

function flagForTeam(teamName: string, fallback?: string): string {
  return fallback || FLAG_BY_TEAM[teamName.toLowerCase().replace(/\s+/g, " ").trim()] || "🏳️";
}

function getMatchDate(item: ApiObject): Date {
  const date = getNestedString(item, [
    ["kickoff"],
    ["kickoff_time"],
    ["kickoffTime"],
    ["date"],
    ["datetime"],
    ["start_time"],
    ["startTime"],
    ["scheduled_at"],
    ["local_date"],
  ]);
  const time = getNestedString(item, [["time"], ["local_time"], ["hour"]]);
  const value = date && time && !date.includes("T") ? `${date}T${time}` : date || time;
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
}

function isLive(status?: string): boolean {
  return /live|in.?progress|playing|1st|2nd|halftime|first half|second half/i.test(status || "");
}

function normalizeMatch(
  item: ApiObject,
  index: number,
  teams: Record<string, ApiObject>,
  stadiums: Record<string, ApiObject>,
  groups: Record<string, ApiObject>
): Match | null {
  const homeValue = getNestedValue(item, [
    ["homeTeam"],
    ["home_team"],
    ["home", "name"],
    ["home"],
    ["team1"],
    ["team_1"],
    ["team1_id"],
    ["team_1_id"],
    ["home_team_id"],
    ["homeTeamId"],
  ]);
  const awayValue = getNestedValue(item, [
    ["awayTeam"],
    ["away_team"],
    ["away", "name"],
    ["away"],
    ["team2"],
    ["team_2"],
    ["team2_id"],
    ["team_2_id"],
    ["away_team_id"],
    ["awayTeamId"],
  ]);

  const homeTeam = resolveName(homeValue, teams);
  const awayTeam = resolveName(awayValue, teams);
  if (!homeTeam || !awayTeam || homeTeam === "TBD" || awayTeam === "TBD") return null;

  const stadiumValue = getNestedValue(item, [["stadium"], ["venue"], ["stadium_id"], ["stadiumId"]]);
  const groupValue = getNestedValue(item, [["group"], ["group_id"], ["groupId"], ["group_name"]]);
  const status = getNestedString(item, [["status"], ["match_status"], ["status_name"], ["state"]]) || "Scheduled";
  const groupName = resolveName(groupValue, groups, "");

  return {
    id: getNestedString(item, [["id"], ["match_id"], ["game_id"]]) || `worldcup-match-${index}`,
    homeTeam,
    homeFlag: flagForTeam(homeTeam, getNestedString(item, [["homeFlag"], ["home_flag"], ["home", "flag"]])),
    awayTeam,
    awayFlag: flagForTeam(awayTeam, getNestedString(item, [["awayFlag"], ["away_flag"], ["away", "flag"]])),
    kickoff: getMatchDate(item),
    venue: resolveName(stadiumValue, stadiums, "FIFA World Cup Stadium"),
    city: resolveField(stadiumValue, stadiums, [["city"], ["host_city"], ["location"]]) || getNestedString(item, [["city"], ["location"]]) || "2026 Host City",
    stage: getNestedString(item, [["stage"], ["round"], ["round_name"], ["phase"]]) || groupName || "FIFA World Cup 2026",
    status,
    homeScore: getNestedNumber(item, [["homeScore"], ["home_score"], ["home_goals"], ["team1_score"], ["team_1_score"], ["score", "home"]]),
    awayScore: getNestedNumber(item, [["awayScore"], ["away_score"], ["away_goals"], ["team2_score"], ["team_2_score"], ["score", "away"]]),
    isLive: isLive(status),
  };
}

function normalizeApiResponse(payload: unknown): { matches: Match[]; updatedAt?: Date; errors: string[]; diagnostics?: ApiDiagnostics } {
  const data = payload && typeof payload === "object" ? (payload as WorldCupPayload) : {};
  const games = asArray(Array.isArray(payload) ? payload : data.games || data.matches || data.data || data.results);
  const teams = buildLookup(data.teams);
  const stadiums = buildLookup(data.stadiums);
  const groups = buildLookup(data.groups);

  const matches = games
    .map((game, index) => normalizeMatch(game, index, teams, stadiums, groups))
    .filter((match): match is Match => Boolean(match))
    .sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return a.kickoff.getTime() - b.kickoff.getTime();
    });

  const updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
  return {
    matches,
    updatedAt: updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : undefined,
    errors: Array.isArray(data.errors) ? data.errors : [],
    diagnostics: data.diagnostics,
  };
}

async function fetchWorldCupMatches() {
  const response = await fetch(WORLD_CUP_API_URL, { headers: { Accept: "application/json" } });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) throw new Error(`/api/worldcup failed with ${response.status}`);
  if (!contentType.includes("application/json")) {
    throw new Error("/api/worldcup returned HTML instead of JSON. Redeploy after API rewrite fix.");
  }
  return normalizeApiResponse(await response.json());
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
  return `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`;
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
    <div className="flex-shrink-0 w-[240px] sm:w-72 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3 sm:p-4 hover:border-red-600/50 hover:bg-white/8 transition-all duration-200 group" data-testid={`match-card-${match.id}`}>
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

      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-2xl sm:text-3xl">{match.homeFlag}</span>
          <span className="text-[10px] sm:text-xs font-bold text-white text-center leading-tight">{match.homeTeam}</span>
        </div>

        <div className="flex flex-col items-center px-2 sm:px-3">
          {hasScore ? <span className="text-white font-black text-lg sm:text-xl tabular-nums">{match.homeScore} - {match.awayScore}</span> : match.isLive ? <span className="text-red-400 font-black text-base sm:text-lg">LIVE</span> : <span className="text-zinc-400 font-bold text-xs sm:text-sm">VS</span>}
          {match.status && <span className="mt-1 text-[9px] text-zinc-600 uppercase tracking-wider">{match.status}</span>}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-2xl sm:text-3xl">{match.awayFlag}</span>
          <span className="text-[10px] sm:text-xs font-bold text-white text-center leading-tight">{match.awayTeam}</span>
        </div>
      </div>

      {match.isLive ? (
        <Link href="/watch/fifa-wc-2026">
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all" data-testid={`watch-match-${match.id}`}>
            <Play className="w-3 h-3 fill-current" />
            Watch Live
          </button>
        </Link>
      ) : countdown ? (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1 text-center">
            {[{ val: countdown.days, label: "D" }, { val: countdown.hours, label: "H" }, { val: countdown.minutes, label: "M" }, { val: countdown.seconds, label: "S" }].map(({ val, label }) => (
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

function EmptyApiState({ message, diagnostics }: { message: string | null; diagnostics?: ApiDiagnostics | null }) {
  return (
    <div className="mx-4 md:mx-16 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
      <div className="flex items-center gap-2 font-bold">
        <AlertTriangle className="h-4 w-4" />
        Real API connected, but no readable match cards were returned.
      </div>
      {message && <p className="mt-2 text-xs text-amber-200/80">{message}</p>}
      {diagnostics && (
        <p className="mt-2 text-xs text-amber-200/70">
          API counts: games {diagnostics.gamesCount ?? 0}, teams {diagnostics.teamsCount ?? 0}, stadiums {diagnostics.stadiumsCount ?? 0}, groups {diagnostics.groupsCount ?? 0}. Game fields: {(diagnostics.gameKeys || []).join(", ") || "none"}.
        </p>
      )}
    </div>
  );
}

export default function MatchScheduleBanner() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<ApiDiagnostics | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMatches() {
      try {
        const result = await fetchWorldCupMatches();
        if (!isMounted) return;
        setDiagnostics(result.diagnostics || null);
        setLastUpdated(result.updatedAt || new Date());

        if (result.matches.length > 0) {
          setMatches(result.matches);
          setApiError(result.errors.length ? result.errors.join(" · ") : null);
        } else {
          setMatches([]);
          setApiError(result.errors.length ? result.errors.join(" · ") : "No readable matches found in the real API response.");
        }
      } catch (error) {
        if (!isMounted) return;
        setMatches([]);
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
      <div className="flex items-center justify-between px-4 md:px-16 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-base sm:text-lg">🏆</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider">FIFA World Cup 2026</h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                <Wifi className="h-2.5 w-2.5" />
                Real API
              </span>
            </div>
            <p className="text-zinc-500 text-[10px] sm:text-xs">
              All Match Updates · Auto-refresh every 60s
              {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-zinc-500" />}
          <button onClick={() => scroll("left")} className="p-1.5 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all" data-testid="schedule-scroll-left" aria-label="Scroll left">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll("right")} className="p-1.5 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all" data-testid="schedule-scroll-right" aria-label="Scroll right">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 md:px-16 text-sm text-zinc-400">Loading real World Cup data...</div>
      ) : matches.length > 0 ? (
        <div id="match-scroll" className="flex gap-3 px-4 md:px-16 overflow-x-auto scrollbar-hide pb-1">
          {matches.map(match => <MatchCard key={match.id} match={match} />)}
        </div>
      ) : (
        <EmptyApiState message={apiError} diagnostics={diagnostics} />
      )}
    </div>
  );
}
