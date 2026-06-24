import { useEffect, useMemo, useState } from "react";
import { fetchWorldCupMatches, type WorldCupMatch } from "@/lib/worldcupApi";

type LoadState = "loading" | "ready" | "error";

function statusText(match: WorldCupMatch) {
  if (match.isLive) return "LIVE";
  if (match.homeScore !== null && match.homeScore !== undefined && match.awayScore !== null && match.awayScore !== undefined) return "FT";
  return match.kickoff.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
}

function hasScore(match: WorldCupMatch) {
  return match.homeScore !== null && match.homeScore !== undefined && match.awayScore !== null && match.awayScore !== undefined;
}

function sortMatches(a: WorldCupMatch, b: WorldCupMatch) {
  if (a.isLive && !b.isLive) return -1;
  if (!a.isLive && b.isLive) return 1;
  return Math.abs(a.kickoff.getTime() - Date.now()) - Math.abs(b.kickoff.getTime() - Date.now());
}

function TickerItem({ match }: { match: WorldCupMatch }) {
  const scoreVisible = hasScore(match);
  const label = statusText(match);
  const color = match.isLive ? "text-red-400" : scoreVisible ? "text-zinc-400" : "text-blue-400";

  return (
    <span className="inline-flex items-center gap-2 px-5 border-r border-white/10 whitespace-nowrap text-sm">
      <span className={`text-[10px] font-black uppercase tracking-widest ${color} min-w-[42px]`}>{label}</span>
      <span className="text-base leading-none">{match.homeFlag}</span>
      <span className="text-white font-semibold">{match.homeTeam}</span>
      {scoreVisible ? (
        <span className="font-black text-white tracking-tight tabular-nums">{match.homeScore} – {match.awayScore}</span>
      ) : (
        <span className="text-zinc-600 font-bold">vs</span>
      )}
      <span className="text-white font-semibold">{match.awayTeam}</span>
      <span className="text-base leading-none">{match.awayFlag}</span>
    </span>
  );
}

export default function ScoreTicker() {
  const [state, setState] = useState<LoadState>("loading");
  const [matches, setMatches] = useState<WorldCupMatch[]>([]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const result = await fetchWorldCupMatches(controller.signal);
        if (!mounted) return;
        setMatches(result.matches);
        setState(result.matches.length ? "ready" : "error");
      } catch {
        if (!mounted) return;
        setMatches([]);
        setState("error");
      }
    };

    load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      mounted = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  const items = useMemo(() => {
    const selected = [...matches].sort(sortMatches).slice(0, 12);
    return [...selected, ...selected];
  }, [matches]);

  return (
    <div className="relative w-full bg-zinc-950 border-b border-white/5 overflow-hidden h-9 flex items-center" data-testid="score-ticker" aria-label="Score ticker">
      <div className="flex-shrink-0 flex items-center gap-2 px-3 h-full bg-red-600 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">WC 2026</span>
      </div>
      <div className="overflow-hidden flex-1 relative">
        {state === "loading" && <div className="px-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Loading match data…</div>}
        {state === "error" && <div className="px-5 text-xs font-bold uppercase tracking-wider text-amber-400">Match data unavailable</div>}
        {state === "ready" && (
          <div className="flex animate-ticker" style={{ animationDuration: `${Math.max(items.length, 1) * 4}s` }}>
            {items.map((match, index) => <TickerItem key={`${match.id}-${index}`} match={match} />)}
          </div>
        )}
      </div>
    </div>
  );
}
