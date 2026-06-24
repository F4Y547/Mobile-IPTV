const DEFAULT_BASE_URL = "https://worldcup26.ir";

function cleanBaseUrl(value) {
  if (!value) return DEFAULT_BASE_URL;
  return String(value).replace(/\/get\/games\/?$/, "").replace(/\/$/, "");
}

async function fetchJson(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}`);
  }
  return response.json();
}

export default async function handler(request, response) {
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

    const payload = {
      source: baseUrl,
      updatedAt: new Date().toISOString(),
      games: games.status === "fulfilled" ? games.value : [],
      teams: teams.status === "fulfilled" ? teams.value : [],
      stadiums: stadiums.status === "fulfilled" ? stadiums.value : [],
      groups: groups.status === "fulfilled" ? groups.value : [],
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
    });
  }
}
