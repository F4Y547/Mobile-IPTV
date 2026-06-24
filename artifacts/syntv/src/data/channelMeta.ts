import type { StreamFormat } from "@/lib/streamFormat";

export type ChannelMeta = {
  format?: StreamFormat;
  quality?: "SD" | "HD" | "FHD" | "4K";
  country?: string;
  language?: string;
  backupUrls?: string[];
  isOfficial?: boolean;
};

export const channelMeta: Record<string, ChannelMeta> = {
  "fifa-wc-2026": {
    format: "hls",
    quality: "HD",
    country: "Global",
    language: "English",
    isOfficial: false,
    backupUrls: [
      "https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8",
      "https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/1080p-vtt/index.m3u8",
    ],
  },
  "caze-tv-fifa-world-cup-2026": {
    format: "hls",
    quality: "FHD",
    country: "BR",
    language: "Portuguese",
    backupUrls: [
      "http://84.17.50.102/fox/index.m3u8",
    ],
  },
  "fifa-plus": {
    format: "hls",
    quality: "HD",
    country: "Global",
    language: "English",
    isOfficial: true,
  },
  "fifa-french": {
    format: "hls",
    quality: "HD",
    country: "Global",
    language: "French",
    isOfficial: true,
  },
  "fifa-usa": {
    format: "hls",
    quality: "HD",
    country: "US",
    language: "English",
    isOfficial: true,
  },
  "fifa-women": {
    format: "hls",
    quality: "HD",
    country: "Global",
    language: "Mixed",
    isOfficial: true,
  },

  // Sports — streams with no file extension need explicit format
  "t-sports": { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "gazi-tv-sports": { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "willow-hd": { format: "hls", quality: "HD", country: "US", language: "English" },
  "a-sports": { format: "hls", quality: "HD", country: "PK", language: "Urdu" },
  "ptv-sports": { format: "hls", quality: "HD", country: "PK", language: "Urdu" },

  // These URLs have no extension — force HLS
  "star-sports-1-hd": {
    format: "hls",
    quality: "HD",
    country: "IN",
    language: "English",
  },
  "star-sports-1-hindi": {
    format: "hls",
    quality: "HD",
    country: "IN",
    language: "Hindi",
  },
  "star-sports-2-hindi": {
    format: "hls",
    quality: "HD",
    country: "IN",
    language: "Hindi",
  },
  "sony-sports-ten-3": {
    format: "hls",
    quality: "HD",
    country: "IN",
    language: "English",
  },
  "sony-sports-ten-5": {
    format: "hls",
    quality: "HD",
    country: "IN",
    language: "Hindi",
  },
  "dd-sports": { format: "hls", quality: "HD", country: "IN", language: "Hindi" },
  "bein-sports": { format: "hls", quality: "HD", country: "QA", language: "Arabic" },

  // News
  "jamuna-tv":     { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "somoy-tv":      { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "ekattor-hd":    { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "channel-24":    { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "atn-news":      { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "independent-tv":{ format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "news-24":       { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "dbc-news":      { format: "hls", quality: "HD", country: "BD", language: "Bangla" },

  // Entertainment
  "bangla-vision": { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "ntv":           { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "boishakhi-tv":  { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "maasranga-tv":  { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "ekushey-tv":    { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "atn-bangla":    { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "btv":           { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "channel-9":     { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "sa-tv":         { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "deepto-tv":     { format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "channel-i-hd":  { format: "hls", quality: "HD", country: "BD", language: "Bangla" },

  // Religious
  "makka-live":    { format: "hls", quality: "HD", country: "SA", language: "Arabic", isOfficial: true },
  "madina-live":   { format: "hls", quality: "HD", country: "SA", language: "Arabic", isOfficial: true },
  "saudi-quran":   { format: "hls", quality: "HD", country: "SA", language: "Arabic", isOfficial: true },
  "peace-tv-bangla":{ format: "hls", quality: "HD", country: "BD", language: "Bangla" },
  "madani-tv":     { format: "hls", quality: "HD", country: "PK", language: "Urdu" },

  // Documentary
  "wild-earth":    { format: "hls", quality: "HD", country: "US", language: "English", isOfficial: true },
  "outdoor-channel":{ format: "hls", quality: "HD", country: "US", language: "English" },
  "real-wild":     { format: "hls", quality: "HD", country: "GB", language: "English" },
  "insight":       { format: "hls", quality: "HD", country: "NL", language: "English", isOfficial: true },
  "travelxp":      { format: "hls", quality: "HD", country: "IN", language: "English", isOfficial: true },
  "cgtn-doc":      { format: "hls", quality: "HD", country: "CN", language: "English", isOfficial: true },

  // Music
  "yrf-music":     { format: "hls", quality: "HD", country: "IN", language: "Hindi", isOfficial: true },
};
