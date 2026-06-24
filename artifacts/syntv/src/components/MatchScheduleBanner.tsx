import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, MapPin, Play, RefreshCw, Wifi } from "lucide-react";
import { fetchWorldCupMatches } from "@/lib/worldcupApi";
import type { ApiDiagnostics, WorldCupApiResult, WorldCupMatch } from "@/lib/worldcupApi";

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

const MATCH_REFRESH_INTERVAL = 60_000;

function getCountdown(kickoff: Date): Countdown | null {
  const diff = kickoff.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function formatKickoff(date: Date): string {
  return `${date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })} · ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  })}`;
}

function getApiStatusCopy(result?: Pick<WorldCupApiResult, "status" | "cache"> | null) {
  if (!result) return { label: "Connecting", className: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300" };
  if (result.status === "stale" || result.cache?.stale) {
    return { label: "Stale API", className: "border-amber-400/25 bg-amber-400/10 text-amber-300" };
  }
  if (result.status === "degraded") {
    return { label: "Partial API", className: "border-amber-400/25 bg-amber-400/10 text-amber-300" };
  }
  if (result.status === "error") {
    return { label: "API Issue", className: "border-red-400/25 bg-red-400/10 text-red-300" };
  }
  return { label: "Real API", className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" };
}

function MatchCard({ match }: { match: WorldCupMatch }) {
  const [countdown, setCountdown] = useState<Countdown | null>(getCountdown(match.kickoff));
  const hasScore =
    match.homeScore !== null &&
    match.homeScore !== undefined &&
    match.awayScore !== null &&
    match.awayScore !== undefined;

  useEffect(() => {
    if (match.isLive) return undefined;
    const interval = window.setInterval(() => setCountdown(getCountdown(match.kickoff)), 1000);
    return () => window.clearInterval(interval);
  }, [match.kickoff, match.isLive]);

  return (
    <div
      className="group flex-shrink-0 w-[240px] sm:w-72 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3 sm:p-4 hover:border-red-600/50 hover:bg-white/8 transition-all duration-200"
      data-testid={`match-card-${match.id}`}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold truncate max-w-[130px]">
          {match.stage}
        </span>
        {match.isLive ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </span>
        ) : (
          <span className="text-[10px] sm:text-xs text-zinc-500 truncate max-w-[120px]">
            {formatKickoff(match.kickoff)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-2xl sm:text-3xl">{match.homeFlag}</span>
          <span className="text-[10px] sm:text-xs font-bold text-white text-center leading-tight line-clamp-2">
            {match.homeTeam}
          </span>
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
          {match.status && (
            <span className="mt-1 text-[9px] text-zinc-600 uppercase tracking-wider max-w-[80px] truncate">
              {match.status}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-2xl sm:text-3xl">{match.awayFlag}</span>
          <span className="text-[10px] sm:text-xs font-bold text-white text-center leading-tight line-clamp-2">
            {match.awayTeam}
          </span>
        </div>
      </div>

      {match.isLive ? (
        <Link href="/watch/fifa-wc-2026">
          <button
            type="button"
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
                <p className="text-white font-black text-xs sm:text-sm tabular-nums">
                  {String(val).padStart(2, "0")}
                </p>
                <p className="text-zinc-600 text-[9px] uppercase">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">
              {match.venue}, {match.city}
            </span>
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

function LoadingCards() {
  return (
    <div className="flex gap-3 px-4 md:px-16 overflow-hidden pb-1">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex-shrink-0 w-[240px] sm:w-72 h-[168px] rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse"
        >
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="mt-8 flex items-center justify-between">
            <div className="h-12 w-12 rounded-full bg-white/10" />
            <div className="h-5 w-10 rounded bg-white/10" />
            <div className="h-12 w-12 rounded-full bg-white/10" />
          </div>
          <div className="mt-8 h-8 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function EmptyApiState({
  message,
  diagnostics,
  onRetry,
}: {
  message: string | null;
  diagnostics?: ApiDiagnostics | null;
  onRetry: () => void;
}) {
  return (
    <div className="mx-4 md:mx-16 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
      <div className="flex items-center gap-2 font-bold">
        <AlertTriangle className="h-4 w-4" />
        Real API connected, but no readable match cards were returned.
      </div>
      {message && <p className="mt-2 text-xs text-amber-200/80">{message}</p>}
      {diagnostics && (
        <p className="mt-2 text-xs text-amber-200/70">
          API counts: games {diagnostics.gamesCount ?? 0}, teams {diagnostics.teamsCount ?? 0}, stadiums{" "}
          {diagnostics.stadiumsCount ?? 0}, groups {diagnostics.groupsCount ?? 0}, readable{" "}
          {diagnostics.readableMatchesCount ?? 0}. Game fields: {(diagnostics.gameKeys || []).join(", ") || "none"}.
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-black hover:bg-amber-200"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry API
      </button>
    </div>
  );
}

export default function MatchScheduleBanner() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [matches, setMatches] = useState<WorldCupMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<ApiDiagnostics | null>(null);
  const [apiResult, setApiResult] = useState<WorldCupApiResult | null>(null);

  const loadMatches = useCallback(async (options?: { silent?: boolean; signal?: AbortSignal }) => {
    const silent = Boolean(options?.silent);
    const signal = options?.signal;

    if (signal?.aborted) return;
    if (silent) setIsRefreshing(true);
    if (!silent) setIsLoading(true);

    try {
      const result = await fetchWorldCupMatches(signal);
      if (signal?.aborted) return;

      setApiResult(result);
      setDiagnostics(result.diagnostics || null);
      setLastUpdated(result.updatedAt || new Date());

      if (result.matches.length > 0) {
        setMatches(result.matches);
        setApiError(result.errors.length ? result.errors.join(" · ") : null);
      } else {
        setMatches([]);
        setApiError(result.errors.length ? result.errors.join(" · ") : "No readable matches found in the API response.");
      }
    } catch (error) {
      if (signal?.aborted) return;

      const message = error instanceof Error ? error.message : "Unable to load live match data.";
      setApiError(message);
      if (!silent) setMatches([]);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadMatches({ signal: controller.signal });

    const interval = window.setInterval(() => {
      loadMatches({ silent: true });
    }, MATCH_REFRESH_INTERVAL);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [loadMatches]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  const statusCopy = getApiStatusCopy(apiResult);

  return (
    <div
      className="relative z-20 bg-gradient-to-r from-black via-zinc-950 to-black border-y border-white/5 py-4 sm:py-5"
      data-testid="match-schedule-banner"
    >
      <div className="flex items-center justify-between px-4 md:px-16 mb-3 sm:mb-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="text-base sm:text-lg">🏆</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider truncate">
                FIFA World Cup 2026
              </h3>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${statusCopy.className}`}
              >
                <Wifi className="h-2.5 w-2.5" />
                {statusCopy.label}
              </span>
            </div>
            <p className="text-zinc-500 text-[10px] sm:text-xs truncate">
              All Match Updates · Auto-refresh every 60s
              {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
              {apiResult?.cache?.hit && ` · Cache ${apiResult.cache.stale ? "stale" : "hit"}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(isLoading || isRefreshing) && <RefreshCw className="h-4 w-4 animate-spin text-zinc-500" />}
          {apiError && matches.length > 0 && (
            <span className="hidden sm:inline-flex max-w-[240px] truncate rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold text-amber-200">
              {apiError}
            </span>
          )}
          <button
            type="button"
            onClick={() => loadMatches({ silent: matches.length > 0 })}
            className="p-1.5 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
            data-testid="schedule-refresh"
            aria-label="Refresh match API"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
            data-testid="schedule-scroll-left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
            data-testid="schedule-scroll-right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingCards />
      ) : matches.length > 0 ? (
        <div ref={scrollRef} className="flex gap-3 px-4 md:px-16 overflow-x-auto scrollbar-hide pb-1">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <EmptyApiState message={apiError} diagnostics={diagnostics} onRetry={() => loadMatches()} />
      )}
    </div>
  );
}
