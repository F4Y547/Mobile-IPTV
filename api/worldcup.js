const DEFAULT_BASE_URL = "https://worldcup26.ir";

function cleanBaseUrl(value) {
  if (!value) return DEFAULT_BASE_URL;
  return String(value).replace(/\/get\/games\/?$/, "").replace(/\/$/, "");
}

async function fetchJson(url, headers) {
  const apiResponse = await fetch(url, { headers });
  if (!apiResponse.ok) {
    throw new Error(`${url} failed with ${apiResponse.status}`);
  }
  return apiResponse.json();
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["data", "results", "items", "games", "matches", "teams", "stadiums", "groups"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [];
}

function sampleKeys(value) {
  const first = asArray(value)[0];
  return first && typeof first === "object" ? Object.keys(first).slice(0, 40) : [];
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
    response.status(204).end();
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

    const payload = {
      source: baseUrl,
      updatedAt: new Date().toISOString(),
      apiKeyConfigured: Boolean(apiKey),
      games: gamesValue,
      teams: teamsValue,
      stadiums: stadiumsValue,
      groups: groupsValue,
      diagnostics: {
        gamesCount: asArray(gamesValue).length,
        teamsCount: asArray(teamsValue).length,
        stadiumsCount: asArray(stadiumsValue).length,
        groupsCount: asArray(groupsValue).length,
        gameKeys: sampleKeys(gamesValue),
        teamKeys: sampleKeys(teamsValue),
        stadiumKeys: sampleKeys(stadiumsValue),
        groupKeys: sampleKeys(groupsValue),
      },
      errors: [games, teams, stadiums, groups]
        .map((result) => (result.status === "rejected" ? result.reason?.message : null))
        .filter(Boolean),
    };

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Unable to fetch World Cup data",
      games: [],
      teams: [],
      stadiums: [],
      groups: [],
      diagnostics: {
        gamesCount: 0,
        teamsCount: 0,
        stadiumsCount: 0,
        groupsCount: 0,
        gameKeys: [],
        teamKeys: [],
        stadiumKeys: [],
        groupKeys: [],
      },
    });
  }
};
