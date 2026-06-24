import type { Channel } from "@/data/channels";
import { detectStreamFormat } from "@/lib/streamFormat";
import { channelMeta } from "@/data/channelMeta";

export type ChannelHealth = "online" | "offline" | "unknown";

type CacheEntry = { status: ChannelHealth; checkedAt: number };

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
const REQUEST_TIMEOUT_MS = 5000;
const cache = new Map<string, CacheEntry>();

function isCorsError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("cors") ||
    msg.includes("load failed") ||
    msg.includes("network request failed")
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

async function probeUrl(url: string, method: "HEAD" | "GET"): Promise<ChannelHealth> {
  try {
    const response = await withTimeout(
      fetch(url, {
        method,
        headers: method === "GET" ? { Range: "bytes=0-512" } : {},
      }),
      REQUEST_TIMEOUT_MS
    );
    if (response.ok || response.status === 206) return "online";
    if (response.status >= 400 && response.status < 500) return "offline";
    return "unknown";
  } catch (err) {
    if (isCorsError(err)) return "unknown"; // CORS doesn't mean offline
    return "offline";
  }
}

export async function checkChannelHealth(channel: Channel): Promise<ChannelHealth> {
  // Return cached result if fresh
  const cached = cache.get(channel.id);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL_MS) return cached.status;

  const meta = channelMeta[channel.id];
  const urls = [channel.url, ...(channel.backupUrls ?? meta?.backupUrls ?? [])].filter(Boolean);
  const format = detectStreamFormat(channel.url, channel.format ?? meta?.format);

  // iframes can't be probed
  if (format === "iframe") {
    cache.set(channel.id, { status: "unknown", checkedAt: Date.now() });
    return "unknown";
  }

  let finalStatus: ChannelHealth = "unknown";

  for (const url of urls) {
    // Try HEAD first (lightweight)
    const headResult = await probeUrl(url, "HEAD");
    if (headResult === "online") { finalStatus = "online"; break; }

    // If HEAD failed with non-CORS reason, try GET with range header
    if (headResult === "offline") {
      const getResult = await probeUrl(url, "GET");
      if (getResult === "online") { finalStatus = "online"; break; }
      if (getResult === "offline") { finalStatus = "offline"; continue; }
    }

    // CORS or unknown — can't determine; try next backup
    finalStatus = "unknown";
  }

  cache.set(channel.id, { status: finalStatus, checkedAt: Date.now() });
  return finalStatus;
}

export function clearHealthCache(): void {
  cache.clear();
}
