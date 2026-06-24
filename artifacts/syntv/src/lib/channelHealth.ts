import type { Channel } from "@/data/channels";

export type ChannelHealth = "online" | "offline" | "unknown";

type CacheEntry = {
  status: ChannelHealth;
  checkedAt: number;
};

type ChannelWithBackups = Channel & { backupUrls?: string[] };

const HEALTH_CACHE_TTL_MS = 3 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 4500;
const cache = new Map<string, CacheEntry>();

function isLikelyCorsOrOpaqueError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("failed to fetch") || message.includes("cors") || message.includes("networkerror") || message.includes("load failed");
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => window.clearTimeout(timeout) };
}

async function probe(url: string, method: "HEAD" | "GET") {
  const { signal, clear } = createTimeoutSignal(REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method,
      signal,
      headers: method === "GET" ? { Range: "bytes=0-256" } : undefined,
    });

    if (response.ok || response.status === 206) return "online";
    if (response.status >= 400 && response.status < 500) return "offline";
    return "unknown";
  } catch (error) {
    if (isLikelyCorsOrOpaqueError(error)) return "unknown";
    return "offline";
  } finally {
    clear();
  }
}

export async function checkChannelHealth(channel: Channel): Promise<ChannelHealth> {
  const cached = cache.get(channel.id);
  if (cached && Date.now() - cached.checkedAt < HEALTH_CACHE_TTL_MS) return cached.status;

  const channelWithBackups = channel as ChannelWithBackups;
  const urls = [channel.url, ...(channelWithBackups.backupUrls || [])].filter(Boolean);
  let finalStatus: ChannelHealth = "unknown";

  for (const url of urls) {
    const headStatus = await probe(url, "HEAD");
    if (headStatus === "online") {
      finalStatus = "online";
      break;
    }

    const getStatus = await probe(url, "GET");
    if (getStatus === "online") {
      finalStatus = "online";
      break;
    }

    if (headStatus === "offline" && getStatus === "offline") finalStatus = "offline";
  }

  cache.set(channel.id, { status: finalStatus, checkedAt: Date.now() });
  return finalStatus;
}
