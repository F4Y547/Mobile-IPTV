const ROUTE_VERSION = "2026-06-23.api-v2";
const DEFAULT_BASE_URL = "https://worldcup26.ir";
const DEFAULT_MATCH_DATE = "2026-06-11T00:00:00Z";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_CACHE_TTL_MS = 60000;

const ENDPOINTS = [
  { key: "games", path: "/get/games", required: true },
  { key: "teams", path: "/get/teams", required: false },
  { key: "stadiums", path: "/get/stadiums", required: false },
  { key: "groups", path: "/get/groups", required: false },
];

const PATHS = {
  home: [
    ["homeTeam"], ["home_team"], ["home", "name"], ["home"], ["home_name"],
    ["homeTeamName"], ["home_team_name"], ["team1"], ["team_1"], ["team1_name"],
    ["team_1_name"], ["teamA"], ["team_a"], ["teamAName"], ["team_a_name"],
    ["team1_id"], ["team_1_id"], ["home_team_id"], ["homeTeamId"], ["home_id"]
  ],
  away: [
    ["awayTeam"], ["away_team"], ["away", "name"], ["away"], ["away_name"],
    ["awayTeamName"], ["away_team_name"], ["team2"], ["team_2"], ["team2_name"],
    ["team_2_name"], ["teamB"], ["team_b"], ["teamBName"], ["team_b_name"],
    ["team2_id"], ["team_2_id"], ["away_team_id"], ["awayTeamId"], ["away_id"]
  ],
  date: [
    ["kickoff"], ["kickoff_time"], ["kickoffTime"], ["date"], ["datetime"],
    ["start_time"], ["startTime"], ["scheduled_at"], ["scheduledAt"], ["local_date"],
    ["match_date"], ["game_date"], ["matchDate"], ["gameDate"]
  ],
  time: [["time"], ["local_time"], ["localTime"], ["hour"], ["match_time"], ["game_time"]],
  stadium: [["stadium"], ["venue"], ["stadium_id"], ["stadiumId"], ["venue_id"], ["venueId"], ["location"]],
  group: [["group"], ["group_id"], ["groupId"], ["group_name"], ["groupName"], ["stage"], ["round"]],
};

const FLAG_BY_TEAM = {
  algeria: "🇩🇿", argentina: "🇦🇷", australia: "🇦🇺", austria: "🇦🇹", belgium: "🇧🇪",
  brazil: "🇧🇷", canada: "🇨🇦", colombia: "🇨🇴", croatia: "🇭🇷", czechia: "🇨🇿",
  ecuador: "🇪🇨", egypt: "🇪🇬", england: "🏴", france: "🇫🇷", germany: "🇩🇪",
  ghana: "🇬🇭", haiti: "🇭🇹", iran: "🇮🇷", iraq: "🇮🇶", italy: "🇮🇹",
  japan: "🇯🇵", jordan: "🇯🇴", mexico: "🇲🇽", morocco: "🇲🇦", netherlands: "🇳🇱",
  norway: "🇳🇴", panama: "🇵🇦", paraguay: "🇵🇾", portugal: "🇵🇹", qatar: "🇶🇦",
  scotland: "🏴", senegal: "🇸🇳", "south africa": "🇿🇦", "south korea": "🇰🇷",
  spain: "🇪🇸", sweden: "🇸🇪", switzerland: "🇨🇭", tunisia: "🇹🇳", turkey: "🇹🇷",
  usa: "🇺🇸", "united states": "🇺🇸", uruguay: "🇺🇾", uzbekistan: "🇺🇿",
};

let memoryCache = null;

function cleanBaseUrl(value) {
  if (!value) return DEFAULT_BASE_URL;
  return String(value)
    .trim()
    .replace(/\/get\/(games|teams|stadiums|groups)\/?$/i, "")
    .replace(/\/$/, "");
}

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function safeErrorMessage(error) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "Unknown upstream API error";
}

function getRequestUrl(request) {
  const host = request.headers?.host || "localhost";
  return new URL(request.url || "/api/worldcup", `https://${host}`);
}

function hasTruthyParam(url, key) {
  const value = url.searchParams.get(key);
  return value === "1" || value === "true" || value === "yes";
}

async function fetchJson(url, headers, timeoutMs) {
  const controller = new AbortController();
  const startedAt = Date.now();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const apiResponse = await fetch(url, { headers, signal: controller.signal });
    const contentType = apiResponse.headers.get("content-type") || "";
    const text = await apiResponse.text();

    if (!apiResponse.ok) {
      throw new Error(`${url} failed with ${apiResponse.status}`);
    }

    if (!contentType.includes("application/json")) {
      throw new Error(`${url} returned ${contentType || "non-JSON"} content`);
    }

    return {
      ok: true,
      status: apiResponse.status,
      durationMs: Date.now() - startedAt,
      data: text ? JSON.parse(text) : null,
    };
  } catch (error) {
    const isAbort = error && typeof error === "object" && error.name === "AbortError";
    throw new Error(isAbort ? `${url} timed out after ${timeoutMs}ms` : safeErrorMessage(error));
  } finally {
    clearTimeout(timer);
  }
}

function getString(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function getNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return null;
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!isRecord(value)) return [];

  for (const key of ["games", "matches", "data", "results", "items", "rows", "records", "teams", "stadiums", "groups"]) {
    if (Array.isArray(value[key])) return asArray(value[key]);
    if (isRecord(value[key])) {
      const nested = asArray(value[key]);
      if (nested.length) return nested;
    }
  }

  const values = Object.values(value);
  if (values.length && values.every((item) => isRecord(item))) return values;
  return [];
}

function getNestedValue(item, paths) {
  for (const path of paths) {
    let current = item;
    for (const key of path) {
      current = current && typeof current === "object" ? current[key] : undefined;
    }
    if (current !== undefined && current !== null && current !== "") return current;
  }
  return undefined;
}

function getNestedString(item, paths) {
  return getString(getNestedValue(item, paths));
}

function getNestedNumber(item, paths) {
  return getNumber(getNestedValue(item, paths));
}

function entityId(item) {
  return getNestedString(item, [
    ["id"], ["_id"], ["teamId"], ["team_id"], ["stadiumId"], ["stadium_id"],
    ["groupId"], ["group_id"], ["code"], ["fifa_code"], ["iso2"], ["iso3"],
    ["abbreviation"], ["slug"]
  ]);
}

function entityName(item) {
  return getNestedString(item, [
    ["name"], ["name_en"], ["en_name"], ["nameEn"], ["english_name"], ["title"],
    ["team_name"], ["teamName"], ["country"], ["country_name"], ["countryName"],
    ["stadium_name"], ["stadiumName"], ["venue_name"], ["venueName"], ["group_name"],
    ["groupName"], ["label"], ["short_name"], ["shortName"]
  ]);
}

function buildLookup(collection) {
  const lookup = {};
  for (const item of asArray(collection)) {
    if (!isRecord(item)) continue;
    const keys = [
      entityId(item),
      entityName(item),
      getNestedString(item, [["code"], ["fifa_code"], ["iso2"], ["iso3"], ["abbreviation"]])
    ];

    for (const key of keys) {
      if (!key) continue;
      lookup[key] = item;
      lookup[String(key).toLowerCase()] = item;
    }
  }
  return lookup;
}

function resolveName(value, lookup, fallback) {
  if (isRecord(value)) return entityName(value) || fallback;
  const raw = getString(value);
  if (!raw) return fallback;
  const found = lookup[raw] || lookup[raw.toLowerCase()];
  return found ? entityName(found) || raw : raw;
}

function resolveField(value, lookup, paths) {
  if (isRecord(value)) return getNestedString(value, paths);
  const raw = getString(value);
  if (!raw) return undefined;
  const found = lookup[raw] || lookup[raw.toLowerCase()];
  return found ? getNestedString(found, paths) : undefined;
}

function flagForTeam(teamName, fallback) {
  const rawFallback = getString(fallback);
  if (rawFallback && rawFallback.length <= 8) return rawFallback;
  return FLAG_BY_TEAM[String(teamName).toLowerCase().replace(/\s+/g, " ").trim()] || "🏳️";
}

function getMatchDate(item) {
  const date = getNestedString(item, PATHS.date);
  const time = getNestedString(item, PATHS.time);
  const value = date && time && !date.includes("T") ? `${date}T${time}` : date || time || DEFAULT_MATCH_DATE;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? DEFAULT_MATCH_DATE : parsed.toISOString();
}

function isLive(status) {
  return /live|in.?progress|playing|1st|2nd|halftime|first half|second half/i.test(status || "");
}

function normalizeMatch(item, index, teams, stadiums, groups) {
  if (!isRecord(item)) return null;

  const homeValue = getNestedValue(item, PATHS.home);
  const awayValue = getNestedValue(item, PATHS.away);
  const homeTeam = resolveName(homeValue, teams, "Team TBD");
  const awayTeam = resolveName(awayValue, teams, "Team TBD");
  const stadiumValue = getNestedValue(item, PATHS.stadium);
  const groupValue = getNestedValue(item, PATHS.group);
  const status = getNestedString(item, [["status"], ["match_status"], ["matchStatus"], ["status_name"], ["statusName"], ["state"]]) || "Scheduled";
  const groupName = resolveName(groupValue, groups, "");
  const venue = resolveName(stadiumValue, stadiums, "FIFA World Cup Stadium");
  const kickoff = getMatchDate(item);

  return {
    id: getNestedString(item, [["id"], ["match_id"], ["matchId"], ["game_id"], ["gameId"]]) || `worldcup-match-${index}`,
    homeTeam,
    homeFlag: flagForTeam(homeTeam, getNestedString(item, [["homeFlag"], ["home_flag"], ["home", "flag"], ["home_flag_url"]])),
    awayTeam,
    awayFlag: flagForTeam(awayTeam, getNestedString(item, [["awayFlag"], ["away_flag"], ["away", "flag"], ["away_flag_url"]])),
    kickoff,
    kickoffTimestamp: new Date(kickoff).getTime(),
    venue,
    city:
      resolveField(stadiumValue, stadiums, [["city"], ["host_city"], ["hostCity"], ["location"]]) ||
      getNestedString(item, [["city"], ["host_city"], ["hostCity"], ["location"]]) ||
      "2026 Host City",
    stage:
      getNestedString(item, [["stage"], ["round"], ["round_name"], ["roundName"], ["phase"], ["matchday"]]) ||
      groupName ||
      "FIFA World Cup 2026",
    status,
    homeScore: getNestedNumber(item, [["homeScore"], ["home_score"], ["home_goals"], ["homeGoals"], ["team1_score"], ["team_1_score"], ["score", "home"]]),
    awayScore: getNestedNumber(item, [["awayScore"], ["away_score"], ["away_goals"], ["awayGoals"], ["team2_score"], ["team_2_score"], ["score", "away"]]),
    isLive: isLive(status),
  };
}

function normalizeMatches(gamesValue, teamsValue, stadiumsValue, groupsValue) {
  const teams = buildLookup(teamsValue);
  const stadiums = buildLookup(stadiumsValue);
  const groups = buildLookup(groupsValue);

  return asArray(gamesValue)
    .map((game, index) => normalizeMatch(game, index, teams, stadiums, groups))
    .filter(Boolean)
    .sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return a.kickoffTimestamp - b.kickoffTimestamp;
    })
    .map(({ kickoffTimestamp, ...match }) => match);
}

function sampleKeys(value) {
  const first = asArray(value)[0];
  return isRecord(first) ? Object.keys(first).slice(0, 40) : [];
}

function countItems(value) {
  return asArray(value).length;
}

function createPayload({ baseUrl, apiKey, values, upstream, errors, includeRaw, cacheState }) {
  const matches = normalizeMatches(values.games, values.teams, values.stadiums, values.groups);
  const payload = {
    status: errors.length ? (matches.length ? "degraded" : "error") : "ok",
    source: baseUrl,
    version: ROUTE_VERSION,
    updatedAt: new Date().toISOString(),
    cache: cacheState,
    apiKeyConfigured: Boolean(apiKey),
    matches,
    games: matches,
    diagnostics: {
      gamesCount: countItems(values.games),
      teamsCount: countItems(values.teams),
      stadiumsCount: countItems(values.stadiums),
      groupsCount: countItems(values.groups),
      readableMatchesCount: matches.length,
      gameKeys: sampleKeys(values.games),
      teamKeys: sampleKeys(values.teams),
      stadiumKeys: sampleKeys(values.stadiums),
      groupKeys: sampleKeys(values.groups),
      upstream,
    },
    errors,
  };

  if (includeRaw) {
    payload.raw = {
      games: values.games,
      teams: values.teams,
      stadiums: values.stadiums,
      groups: values.groups,
    };
  }

  return payload;
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
}

function sendJson(response, status, payload, cacheTtlMs) {
  setCors(response);
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", `s-maxage=${Math.floor(cacheTtlMs / 1000)}, stale-while-revalidate=300`);
  response.status(status).json(payload);
}

module.exports = async function handler(request, response) {
  setCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, { status: "error", error: "Method not allowed", matches: [], games: [] }, DEFAULT_CACHE_TTL_MS);
    return;
  }

  const requestUrl = getRequestUrl(request);
  const includeRaw = hasTruthyParam(requestUrl, "raw") || hasTruthyParam(requestUrl, "debug");
  const bypassCache = hasTruthyParam(requestUrl, "refresh") || hasTruthyParam(requestUrl, "noCache");
  const timeoutMs = toPositiveInt(process.env.WORLDCUP_API_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const cacheTtlMs = toPositiveInt(process.env.WORLDCUP_API_CACHE_TTL_MS, DEFAULT_CACHE_TTL_MS);
  const baseUrl = cleanBaseUrl(
    requestUrl.searchParams.get("baseUrl") ||
      process.env.WORLDCUP_API_BASE_URL ||
      process.env.WORLDCUP_API_URL ||
      process.env.VITE_WORLDCUP_API_URL
  );
  const apiKey = process.env.WORLDCUP_API_KEY || process.env.VITE_WORLDCUP_API_KEY || "";

  if (!bypassCache && memoryCache && memoryCache.baseUrl === baseUrl && Date.now() - memoryCache.createdAt < cacheTtlMs) {
    sendJson(response, 200, {
      ...memoryCache.payload,
      cache: {
        hit: true,
        ageMs: Date.now() - memoryCache.createdAt,
        ttlMs: cacheTtlMs,
      },
      raw: includeRaw ? memoryCache.raw : undefined,
    }, cacheTtlMs);
    return;
  }

  const headers = { Accept: "application/json" };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
    headers["x-api-key"] = apiKey;
  }

  const settled = await Promise.allSettled(
    ENDPOINTS.map(async (endpoint) => {
      const result = await fetchJson(`${baseUrl}${endpoint.path}`, headers, timeoutMs);
      return {
        ...endpoint,
        data: result.data,
        status: result.status,
        durationMs: result.durationMs,
      };
    })
  );

  const values = { games: [], teams: [], stadiums: [], groups: [] };
  const upstream = [];
  const errors = [];

  settled.forEach((result, index) => {
    const endpoint = ENDPOINTS[index];

    if (result.status === "fulfilled") {
      values[endpoint.key] = result.value.data;
      upstream.push({
        key: endpoint.key,
        ok: true,
        status: result.value.status,
        durationMs: result.value.durationMs,
        count: countItems(result.value.data),
      });
      return;
    }

    const message = safeErrorMessage(result.reason);
    upstream.push({
      key: endpoint.key,
      ok: false,
      required: endpoint.required,
      error: message,
      count: 0,
    });
    errors.push(`${endpoint.key}: ${message}`);
  });

  const requiredFailed = upstream.some((entry) => entry.required && !entry.ok);

  if (requiredFailed && memoryCache && memoryCache.baseUrl === baseUrl) {
    sendJson(response, 200, {
      ...memoryCache.payload,
      status: "stale",
      cache: {
        hit: true,
        stale: true,
        ageMs: Date.now() - memoryCache.createdAt,
        ttlMs: cacheTtlMs,
      },
      errors,
      raw: includeRaw ? memoryCache.raw : undefined,
    }, cacheTtlMs);
    return;
  }

  const payload = createPayload({
    baseUrl,
    apiKey,
    values,
    upstream,
    errors,
    includeRaw,
    cacheState: {
      hit: false,
      ttlMs: cacheTtlMs,
    },
  });

  if (payload.matches.length > 0) {
    memoryCache = {
      baseUrl,
      createdAt: Date.now(),
      payload: { ...payload, raw: undefined },
      raw: {
        games: values.games,
        teams: values.teams,
        stadiums: values.stadiums,
        groups: values.groups,
      },
    };
  }

  sendJson(response, 200, payload, cacheTtlMs);
}
