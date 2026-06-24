export type ApiDiagnostics = {
  gamesCount?: number;
  teamsCount?: number;
  stadiumsCount?: number;
  groupsCount?: number;
  readableMatchesCount?: number;
  gameKeys?: string[];
  teamKeys?: string[];
  stadiumKeys?: string[];
  groupKeys?: string[];
  upstream?: Array<{
    key: string;
    ok: boolean;
    required?: boolean;
    status?: number;
    durationMs?: number;
    count?: number;
    error?: string;
  }>;
};

export type WorldCupMatch = {
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

export type WorldCupApiResult = {
  matches: WorldCupMatch[];
  updatedAt?: Date;
  status: "ok" | "degraded" | "stale" | "error" | "unknown";
  source?: string;
  version?: string;
  errors: string[];
  diagnostics?: ApiDiagnostics;
  cache?: {
    hit?: boolean;
    stale?: boolean;
    ageMs?: number;
    ttlMs?: number;
  };
};

type ApiRecord = Record<string, unknown>;

const WORLD_CUP_API_URL = "/api/worldcup";

function isRecord(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

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

function asArray(value: unknown): ApiRecord[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];

  for (const key of ["matches", "games", "data", "results", "items", "rows", "records"]) {
    const nested = value[key];
    if (Array.isArray(nested)) return nested.filter(isRecord);
    if (isRecord(nested)) {
      const nestedArray = asArray(nested);
      if (nestedArray.length > 0) return nestedArray;
    }
  }

  const values = Object.values(value);
  if (values.length > 0 && values.every(isRecord)) return values;
  return [];
}

function parseDate(value: unknown): Date | null {
  const text = getString(value);
  if (!text) return null;

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseErrors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => getString(item)).filter((item): item is string => Boolean(item));
}

function coerceMatch(value: ApiRecord, index: number): WorldCupMatch | null {
  const homeTeam = getString(value.homeTeam) || getString(value.home_team) || getString(value.home);
  const awayTeam = getString(value.awayTeam) || getString(value.away_team) || getString(value.away);
  const kickoff = parseDate(value.kickoff);

  if (!homeTeam || !awayTeam || !kickoff) return null;

  return {
    id: getString(value.id) || getString(value.match_id) || getString(value.game_id) || `worldcup-match-${index}`,
    homeTeam,
    homeFlag: getString(value.homeFlag) || getString(value.home_flag) || "🏳️",
    awayTeam,
    awayFlag: getString(value.awayFlag) || getString(value.away_flag) || "🏳️",
    kickoff,
    venue: getString(value.venue) || getString(value.stadium) || "FIFA World Cup Stadium",
    city: getString(value.city) || "2026 Host City",
    stage: getString(value.stage) || getString(value.round) || "FIFA World Cup 2026",
    status: getString(value.status) || "Scheduled",
    homeScore: getNumber(value.homeScore ?? value.home_score),
    awayScore: getNumber(value.awayScore ?? value.away_score),
    isLive: Boolean(value.isLive),
  };
}

export function normalizeWorldCupPayload(payload: unknown): WorldCupApiResult {
  const data = isRecord(payload) ? payload : {};
  const rawMatches = asArray(data.matches).length > 0 ? asArray(data.matches) : asArray(data.games);
  const matches = rawMatches
    .map(coerceMatch)
    .filter((match): match is WorldCupMatch => Boolean(match))
    .sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return a.kickoff.getTime() - b.kickoff.getTime();
    });

  const updatedAt = parseDate(data.updatedAt);
  const diagnostics = isRecord(data.diagnostics) ? (data.diagnostics as ApiDiagnostics) : undefined;
  const cache = isRecord(data.cache) ? (data.cache as WorldCupApiResult["cache"]) : undefined;
  const status = getString(data.status);

  return {
    matches,
    updatedAt: updatedAt || undefined,
    status: status === "ok" || status === "degraded" || status === "stale" || status === "error" ? status : "unknown",
    source: getString(data.source),
    version: getString(data.version),
    errors: parseErrors(data.errors),
    diagnostics,
    cache,
  };
}

export async function fetchWorldCupMatches(signal?: AbortSignal): Promise<WorldCupApiResult> {
  const response = await fetch(WORLD_CUP_API_URL, {
    headers: { Accept: "application/json" },
    signal,
  });
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error("/api/worldcup returned HTML instead of JSON. Check the Vercel API route and rewrites.");
  }

  let payload: unknown;
  try {
    payload = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    throw new Error("/api/worldcup returned invalid JSON.");
  }

  if (!response.ok) {
    const data = isRecord(payload) ? payload : {};
    const errorMessage = getString(data.error) || `/api/worldcup failed with ${response.status}`;
    throw new Error(errorMessage);
  }

  return normalizeWorldCupPayload(payload);
}
