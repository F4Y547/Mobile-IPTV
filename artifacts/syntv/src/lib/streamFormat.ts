export type StreamFormat = "hls" | "mpegts" | "dash" | "mp4" | "mkv" | "iframe" | "unknown";

export function detectStreamFormat(url: string, explicitFormat?: StreamFormat): StreamFormat {
  if (explicitFormat) return explicitFormat;

  const cleanUrl = url.split("?")[0].toLowerCase();
  const lowerUrl = url.toLowerCase();

  if (cleanUrl.endsWith(".m3u8")) return "hls";
  if (cleanUrl.endsWith(".ts")) return "mpegts";
  if (cleanUrl.endsWith(".mpd")) return "dash";
  if (cleanUrl.endsWith(".mp4")) return "mp4";
  if (cleanUrl.endsWith(".mkv")) return "mkv";
  if (
    lowerUrl.includes("youtube.com/embed") ||
    lowerUrl.includes("youtube.com/watch") ||
    lowerUrl.includes("youtu.be") ||
    lowerUrl.includes("player.vimeo.com") ||
    lowerUrl.includes("iframe")
  ) return "iframe";

  return "unknown";
}

export function isPlayableDirectVideo(format: StreamFormat) {
  return ["mp4", "mpegts", "mkv"].includes(format);
}

export function formatLabel(format: StreamFormat) {
  switch (format) {
    case "hls": return "HLS";
    case "mpegts": return "MPEG-TS";
    case "dash": return "DASH";
    case "mp4": return "MP4";
    case "mkv": return "MKV";
    case "iframe": return "IFRAME";
    default: return "UNKNOWN";
  }
}
