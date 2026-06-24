export type StreamFormat = "hls" | "mpegts" | "dash" | "mp4" | "iframe" | "unknown";

export function detectStreamFormat(url: string, explicitFormat?: StreamFormat): StreamFormat {
  if (explicitFormat && explicitFormat !== "unknown") return explicitFormat;

  const cleanUrl = url.split("?")[0].toLowerCase();
  const lowerUrl = url.toLowerCase();

  if (cleanUrl.endsWith(".m3u8")) return "hls";
  if (cleanUrl.endsWith(".m3u")) return "hls";
  if (cleanUrl.endsWith(".mpd")) return "dash";
  if (cleanUrl.endsWith(".mp4")) return "mp4";
  if (cleanUrl.endsWith(".mkv")) return "mp4";
  if (cleanUrl.endsWith(".webm")) return "mp4";

  // Raw MPEG-TS: only if the last segment is truly .ts (not .ts.m3u8)
  if (cleanUrl.endsWith(".ts") && !cleanUrl.endsWith(".m3u8")) return "mpegts";

  // Iframe / embed sources
  if (
    lowerUrl.includes("youtube.com/embed") ||
    lowerUrl.includes("youtu.be/") ||
    lowerUrl.includes("player.vimeo.com") ||
    lowerUrl.includes("dailymotion.com/embed") ||
    lowerUrl.includes("twitch.tv/embed")
  ) return "iframe";

  // HLS heuristics for extensionless IPTV URLs
  if (
    cleanUrl.includes("/hls/") ||
    cleanUrl.includes("/live/") ||
    cleanUrl.includes("/playlist") ||
    cleanUrl.includes("/master") ||
    cleanUrl.includes("/index") ||
    cleanUrl.includes("/stream") ||
    cleanUrl.includes(".m3u") ||
    // Common IPTV server path patterns
    /\/play\/[a-z0-9]+$/.test(cleanUrl) ||
    /\/(live|hls|stream|channel)\//i.test(cleanUrl)
  ) return "hls";

  return "unknown";
}

export function isPlayableDirectVideo(format: StreamFormat): boolean {
  return format === "mp4" || format === "mpegts";
}

export function formatLabel(format: StreamFormat): string {
  switch (format) {
    case "hls":     return "HLS";
    case "mpegts":  return "MPEG-TS";
    case "dash":    return "DASH";
    case "mp4":     return "MP4";
    case "iframe":  return "IFRAME";
    default:        return "UNKNOWN";
  }
}

export function formatBadgeColor(format: StreamFormat): string {
  switch (format) {
    case "hls":    return "bg-red-600";
    case "dash":   return "bg-blue-600";
    case "mpegts": return "bg-orange-600";
    case "mp4":    return "bg-green-600";
    case "iframe": return "bg-purple-600";
    default:       return "bg-zinc-600";
  }
}
