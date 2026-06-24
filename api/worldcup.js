const DEFAULT_BASE_URL = "https://worldcup26.ir";
const DEFAULT_MATCH_DATE = "2026-06-11T00:00:00Z";

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
    ["match_date"], ["game_date"]
  ],
  time: [["time"], ["local_time"], ["hour"], ["match_time"], ["game_time"]],
  stadium: [["stadium"], ["venue"], ["stadium_id"], ["stadiumId"], ["venue_id"], ["location"]],
  group: [["group"], ["group_id"], ["groupId"], ["group_name"], ["stage"], ["round"]]
};

const FLAG_BY_TEAM = {
  argentina: "🇦🇷", australia: "🇦🇺", austria: "🇦🇹", belgium: "🇧🇪", brazil: "🇧🇷",
  canada: "🇨🇦", colombia: "🇨🇴", croatia: "🇭🇷", ecuador: "🇪🇨", egypt: "🇪🇬",
  england: "🏴", france: "🇫🇷", germany: "🇩🇪", ghana: "🇬🇭", haiti: "🇭🇹",
  iran: "🇮🇷", iraq: "🇮🇶", japan: "🇯🇵", jordan: "🇯🇴", mexico: "🇲🇽",
  morocco: "🇲🇦", netherlands: "🇳🇱", norway: "🇳🇴", panama: "🇵🇦", paraguay: "🇵🇾",
  portugal: "🇵🇹", qatar: "🇶🇦", scotland: "🏴", senegal: "🇸🇳", "south africa": "🇿🇦",
  "south korea": "🇰🇷", spain: "🇪🇸", sweden: "🇸🇪", switzerland: "🇨🇭", tunisia: "🇹🇳",
  turkey: "🇹🇷", usa: "🇺🇸", "united states": "🇺🇸", uruguay: "🇺🇾", uzbekistan: "🇺🇿"
};

function cleanBaseUrl(value) {
  if (!value) return DEFAULT_BASE_URL;
  return String(value).replace(/\/get\/(games|teams|stadiums|groups)\/?$/, "").replace(/\/$/, "");
}

async function fetchJson(url, headers) {
  const apiResponse = await fetch(url, { headers });
  if (!apiResponse.ok) throw new Error(`${url} failed with ${apiResponse.status}`);
  return apiResponse.json();
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
  if (!value || typeof value !== "object") return [];

  for (const key of ["games", "matches", "data", "results", "items", "teams", "stadiums", "groups"]) {
    if (Array.isArray(value[key])) return asArray(value[key]);
  }

  const values = Object.values(value);
  if (values.length && values.every((item) => item && typeof item === "object")) return values;
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
    ["stadium_name"], ["stadiumName"], ["venue_name"], ["group_name"], ["label"],
    ["short_name"], ["shortName"]
  ]);
}

function buildLookup(collection) {
  const lookup = {};
  for (const item of asArray(collection)) {
    if (!item || typeof item !== "object") continue;
    const id = entityId(item);
    const name = entityName(item);
    const code = getNestedString(item, [["code"], ["fifa_code"], ["iso2"], ["iso3"], ["abbreviation"]]);
    for (const key of [id, name, code]) {
      if (key) {
        lookup[key] = item;
        lookup[String(key).toLowerCase()] = item;
      }
    }
  }
  return lookup;
}

function resolveName(value, lookup, fallback) {
  if (value && typeof value === "object") return entityName(value) || fallback;
  const raw = getString(value);
  if (!raw) return fallback;
  const found = lookup[raw] || lookup[raw.toLowerCase()];
  return found ? entityName(found) || raw : raw;
}

function resolveField(value, lookup, paths) {
  if (value && typeof value === "object") return getNestedString(value, paths);
  const raw = getString(value);
  if (!raw) return undefined;
  const found = lookup[raw] || lookup[raw.toLowerCase()];
  return found ? getNestedString(found, paths) : undefined;
}

function flagForTeam(teamName, fallback) {
  return fallback || FLAG_BY_TEAM[String(teamName).toLowerCase().replace(/\s+/g, " ").trim()] || "🏳️";
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
  if (!item || typeof item !== "object") return null;

  const homeValue = getNestedValue(item, PATHS.home);
  const awayValue = getNestedValue(item, PATHS.away);
  const homeTeam = resolveName(homeValue, teams, "Team TBD");
  const awayTeam = resolveName(awayValue, teams, "Team TBD");
  const stadiumValue = getNestedValue(item, PATHS.stadium);
  const groupValue = getNestedValue(item, PATHS.group);
  const status = getNestedString(item, [["status"], ["match_status"], ["status_name"], ["state"]]) || "Scheduled";
  const groupName = resolveName(groupValue, groups, "");
  const venue = resolveName(stadiumValue, stadiums, "FIFA World Cup Stadium");

  return {
    id: getNestedString(item, [["id"], ["match_id"], ["game_id"], ["gameId"]]) || `worldcup-match-${index}`,
    homeTeam,
    homeFlag: flagForTeam(homeTeam, getNestedString(item, [["homeFlag"], ["home_flag"], ["home", "flag"], ["home_flag_url"]])),
    awayTeam,
    awayFlag: flagForTeam(awayTeam, getNestedString(item, [["awayFlag"], ["away_flag"], ["away", "flag"], ["away_flag_url"]])),
    kickoff: getMatchDate(item),
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
    homeScore: getNestedNumber(item, [["homeScore"], ["home_score"], ["home_goals"], ["team1_score"], ["team_1_score"], ["score", "home"]]),
    awayScore: getNestedNumber(item, [["awayScore"], ["away_score"], ["away_goals"], ["team2_score"], ["team_2_score"], ["score", "away"]]),
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
      return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
    });
}

function sampleKeys(value) {
  const first = asArray(value)[0];
  return first && typeof first === "object" ? Object.keys(first).slice(0, 40) : [];
}

function sendJson(response, status, payload) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.status(status).json(payload);
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const baseUrl = cleanBaseUrl(
    process.env.WORLDCUP_API_BASE_URL ||
      process.env.WORLDCUP_API_URL ||
      process.env.VITE_WORLDCUP_API_URL
  );
  const apiKey = process.env.WORLDCUP_API_KEY || process.env.VITE_WORLDCUP_API_KEY || "";

  const headers = { Accept: "application/json" };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
    headers["x-api-key"] = apiKey;
  }

  try {
    const [games, teams, stadiums, groups] = await Promise.allSettled([
      fetchJson(`${baseUrl}/get/games`, headers),
      fetchJson(`${baseUrl}/get/teams`, headers),
      fetchJson(`${baseUrl}/get/stadiums`, headers),
      fetchJson(`${baseUrl}/get/groups`, headers),
    ]);

    const gamesValue = games.status === "fulfilled" ? games.value : [];
    const teamsValue = teams.status === "fulfilled" ? teams.value : [];
    const stadiumsValue = stadiums.status === "fulfilled" ? stadiums.value : [];
    const groupsValue = groups.status === "fulfilled" ? groups.value : [];
    const matches = normalizeMatches(gamesValue, teamsValue, stadiumsValue, groupsValue);

    const errors = [games, teams, stadiums, groups]
      .map((result) => (result.status === "rejected" ? result.reason?.message : null))
      .filter(Boolean);

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    sendJson(response, 200, {
      source: baseUrl,
      updatedAt: new Date().toISOString(),
      apiKeyConfigured: Boolean(apiKey),
      matches,
      games: matches,
      raw: {
        games: gamesValue,
        teams: teamsValue,
        stadiums: stadiumsValue,
        groups: groupsValue,
      },
      diagnostics: {
        gamesCount: asArray(gamesValue).length,
        teamsCount: asArray(teamsValue).length,
        stadiumsCount: asArray(stadiumsValue).length,
        groupsCount: asArray(groupsValue).length,
        readableMatchesCount: matches.length,
        gameKeys: sampleKeys(gamesValue),
        teamKeys: sampleKeys(teamsValue),
        stadiumKeys: sampleKeys(stadiumsValue),
        groupKeys: sampleKeys(groupsValue),
      },
      errors,
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unable to fetch World Cup data",
      matches: [],
      games: [],
      diagnostics: {
        gamesCount: 0,
        teamsCount: 0,
        stadiumsCount: 0,
        groupsCount: 0,
        readableMatchesCount: 0,
        gameKeys: [],
        teamKeys: [],
        stadiumKeys: [],
        groupKeys: [],
      },
    });
  }
};
