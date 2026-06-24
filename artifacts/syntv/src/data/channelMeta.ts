export type ChannelMeta = {
  country?: string;
  language?: string;
  quality?: "SD" | "HD" | "FHD" | "4K";
  sourceType?: "hls" | "ts" | "dash" | "iframe";
  backupUrls?: string[];
  isOfficial?: boolean;
  isActive?: boolean;
};

export const channelMeta: Record<string, ChannelMeta> = {
  "fifa-wc-2026": {
    country: "Global",
    language: "Mixed",
    quality: "HD",
    sourceType: "hls",
    isActive: true,
    backupUrls: [
      "https://1nyaler.streamhostingcdn.top/stream/106/index.m3u8",
      "https://d1211whpimeups.cloudfront.net/smil:rtbgo/chunklist.m3u8",
      "https://d1211whpimeups.cloudfront.net/smil:rtbgo/chunklist_b4096000_slENG.m3u8",
      "https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/1080p-vtt/index.m3u8"
    ]
  },
  "t-sports": {
    country: "BD",
    language: "Bangla",
    quality: "HD",
    sourceType: "hls",
    isActive: true,
    backupUrls: [
      "http://198.195.239.50:8095/tsports/index.m3u8",
      "http://198.195.239.50:8095/tsports/tracks-v1a1/mono.m3u8"
    ]
  },
  "somoy-tv": {
    country: "BD",
    language: "Bangla",
    quality: "HD",
    sourceType: "hls",
    isActive: true,
    backupUrls: [
      "https://live.thebosstv.com:30443/dwlive/Somoy-TV/chunks.m3u8"
    ]
  },
  "jamuna-tv": { country: "BD", language: "Bangla", quality: "HD", sourceType: "hls", isActive: true },
  "channel-24": { country: "BD", language: "Bangla", quality: "HD", sourceType: "hls", isActive: true },
  "independent-tv": { country: "BD", language: "Bangla", quality: "HD", sourceType: "hls", isActive: true },
  "ekattor-hd": { country: "BD", language: "Bangla", quality: "HD", sourceType: "hls", isActive: true },
  "atn-news": { country: "BD", language: "Bangla", quality: "HD", sourceType: "hls", isActive: true },
  "dbc-news": { country: "BD", language: "Bangla", quality: "HD", sourceType: "hls", isActive: true },
  "dw-english-hd": { country: "DE", language: "English", quality: "HD", sourceType: "hls", isActive: true, isOfficial: true },
  "cnn-now": { country: "US", language: "English", quality: "HD", sourceType: "hls", isActive: true },
  "caze-tv": { country: "BR", language: "Portuguese", quality: "FHD", sourceType: "hls", isActive: true },
  "dazn-direct": { country: "Global", language: "Mixed", quality: "HD", sourceType: "hls", isActive: true },
  "go-live-sports": { country: "Global", language: "Mixed", quality: "HD", sourceType: "hls", isActive: true },
  "go-live-sports-b": { country: "Global", language: "English", quality: "HD", sourceType: "hls", isActive: true },
};

export function getChannelMeta(channelId: string): ChannelMeta {
  return channelMeta[channelId] || {};
}
