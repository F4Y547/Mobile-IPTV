import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import type { Channel } from "@/data/channels";
import { detectStreamFormat, formatLabel, type StreamFormat } from "@/lib/streamFormat";
import { AlertCircle, Maximize2, Minimize2, Pause, Play, RefreshCw, Volume2, VolumeX } from "lucide-react";

interface UniversalPlayerProps {
  url: string;
  channel: Channel;
  isMini?: boolean;
}

type ChannelWithPlayback = Channel & {
  format?: StreamFormat;
  sourceType?: "hls" | "ts" | "dash" | "iframe";
  backupUrls?: string[];
};

type QualityLevel = {
  index: number;
  label: string;
};

type DashPlayer = {
  initialize: (video: HTMLVideoElement, url: string, autoplay: boolean) => void;
  reset: () => void;
  on?: (event: string, callback: (event?: unknown) => void) => void;
};

type DashJsGlobal = {
  MediaPlayer: () => { create: () => DashPlayer };
};

declare global {
  interface Window {
    dashjs?: DashJsGlobal;
  }
}

const DASH_JS_URL = "https://cdn.dashjs.org/latest/dash.all.min.js";
const MAX_RETRIES_PER_SOURCE = 2;

function getPlaybackChannel(channel: Channel) {
  return channel as ChannelWithPlayback;
}

function sourceTypeToFormat(sourceType?: ChannelWithPlayback["sourceType"]): StreamFormat | undefined {
  if (!sourceType) return undefined;
  if (sourceType === "ts") return "mpegts";
  return sourceType;
}

function uniqueSources(primary: string, backups?: string[]) {
  return Array.from(new Set([primary, ...(backups || [])].filter(Boolean)));
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function loadDashJs() {
  if (window.dashjs) return Promise.resolve(window.dashjs);

  return new Promise<DashJsGlobal>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${DASH_JS_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => window.dashjs ? resolve(window.dashjs) : reject(new Error("dash.js failed to initialize")), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("dash.js failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = DASH_JS_URL;
    script.async = true;
    script.onload = () => window.dashjs ? resolve(window.dashjs) : reject(new Error("dash.js failed to initialize"));
    script.onerror = () => reject(new Error("dash.js failed to load"));
    document.head.appendChild(script);
  });
}

function directUnsupportedMessage(format: StreamFormat) {
  if (format === "mpegts") return "This MPEG-TS stream may not play in your browser. Try an HLS backup.";
  if (format === "mkv") return "This MKV stream may not play in your browser. Try an HLS or MP4 backup.";
  return "This direct video stream is not supported by your browser.";
}

export default function UniversalPlayer({ url, channel, isMini = false }: UniversalPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<DashPlayer | null>(null);
  const retryCountRef = useRef(0);

  const playbackChannel = getPlaybackChannel(channel);
  const sources = useMemo(() => uniqueSources(url, playbackChannel.backupUrls), [url, playbackChannel.backupUrls]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const activeUrl = sources[sourceIndex] || url;
  const format = detectStreamFormat(activeUrl, playbackChannel.format || sourceTypeToFormat(playbackChannel.sourceType));

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(format === "hls" || format === "dash");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Loading stream…");
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState(-1);

  const canTryBackup = sourceIndex < sources.length - 1;
  const canSeek = Number.isFinite(duration) && duration > 0 && !isLiveStream;
  const progress = canSeek ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 100;

  const destroyPlayers = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (dashRef.current) {
      dashRef.current.reset();
      dashRef.current = null;
    }
  }, []);

  const tryNextSource = useCallback(() => {
    if (!canTryBackup) {
      setError("All stream sources failed. Please report this channel.");
      setIsLoading(false);
      return;
    }

    retryCountRef.current = 0;
    setError(null);
    setIsLoading(true);
    setStatusMessage(`${formatLabel(format)} stream is unavailable. Trying backup source…`);
    setSourceIndex((index) => Math.min(index + 1, sources.length - 1));
  }, [canTryBackup, format, sources.length]);

  const retryCurrentSource = useCallback(() => {
    retryCountRef.current = 0;
    setError(null);
    setIsLoading(true);
    setStatusMessage("Retrying stream…");
    setSourceIndex((index) => index);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => setIsPlaying(false));
    }
  }, []);

  useEffect(() => {
    setSourceIndex(0);
    retryCountRef.current = 0;
    setError(null);
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || format === "iframe") {
      setIsLoading(false);
      return;
    }

    destroyPlayers();
    setError(null);
    setIsLoading(true);
    setStatusMessage(sourceIndex === 0 ? "Loading stream…" : `Trying backup source ${sourceIndex + 1}…`);
    setQualityLevels([]);
    setSelectedQuality(-1);

    video.controls = false;
    video.autoplay = true;
    video.playsInline = true;
    video.volume = volume;
    video.muted = isMuted;

    const updateDuration = () => {
      const nextDuration = video.duration;
      setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
      setIsLiveStream(!Number.isFinite(nextDuration) || nextDuration === Infinity || format === "hls" || format === "dash");
    };

    const handleLoaded = () => {
      updateDuration();
      setIsLoading(false);
      setStatusMessage("");
    };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolume = () => {
      setVolume(video.volume);
      setIsMuted(video.muted || video.volume === 0);
    };
    const handleVideoError = () => {
      if (format === "mpegts" || format === "mkv") {
        setStatusMessage(directUnsupportedMessage(format));
      }
      if (canTryBackup) {
        tryNextSource();
        return;
      }
      setError(format === "unknown" ? "Unsupported stream format. Please add a format or use an HLS/MP4/DASH link." : `${formatLabel(format)} stream is unavailable.`);
      setIsLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("durationchange", updateDuration);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolume);
    video.addEventListener("error", handleVideoError);

    if (format === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDurationCount: 3,
          maxBufferLength: 30,
        });
        hlsRef.current = hls;
        hls.loadSource(activeUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls.levels.map((level, index) => ({ index, label: level.height ? `${level.height}p` : `Level ${index + 1}` }));
          setQualityLevels(levels);
          setIsLoading(false);
          setStatusMessage("");
          video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryCountRef.current < MAX_RETRIES_PER_SOURCE) {
            retryCountRef.current += 1;
            setStatusMessage(`Network issue. Retrying ${retryCountRef.current}/${MAX_RETRIES_PER_SOURCE}…`);
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && retryCountRef.current < MAX_RETRIES_PER_SOURCE) {
            retryCountRef.current += 1;
            setStatusMessage(`Media issue. Recovering ${retryCountRef.current}/${MAX_RETRIES_PER_SOURCE}…`);
            hls.recoverMediaError();
            return;
          }
          tryNextSource();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = activeUrl;
        video.play().catch(() => setIsPlaying(false));
      } else {
        setError("Your browser does not support HLS playback.");
        setIsLoading(false);
      }
    } else if (format === "dash") {
      loadDashJs()
        .then((dashjs) => {
          const player = dashjs.MediaPlayer().create();
          dashRef.current = player;
          player.initialize(video, activeUrl, true);
          player.on?.("error", () => tryNextSource());
          setIsLoading(false);
          setStatusMessage("");
        })
        .catch(() => {
          if (canTryBackup) tryNextSource();
          else {
            setError("DASH stream is unavailable. Trying backup source failed.");
            setIsLoading(false);
          }
        });
    } else if (format === "mp4" || format === "mpegts" || format === "mkv") {
      video.src = activeUrl;
      video.play().catch(() => {
        if (canTryBackup) tryNextSource();
        else setError(directUnsupportedMessage(format));
      });
    } else {
      setError("Unsupported stream format. Please add a format or use an HLS/MP4/DASH link.");
      setIsLoading(false);
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("durationchange", updateDuration);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolume);
      video.removeEventListener("error", handleVideoError);
      destroyPlayers();
      video.removeAttribute("src");
      video.load();
    };
  }, [activeUrl, canTryBackup, destroyPlayers, format, isMuted, sourceIndex, tryNextSource, volume]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || error || format === "iframe") return;
    if (video.paused) video.play().catch(() => setIsPlaying(false));
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !(video.muted || video.volume === 0);
    if (!video.muted && video.volume === 0) video.volume = 0.5;
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextVolume = Number(event.target.value);
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
  };

  const handleQualityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextQuality = Number(event.target.value);
    setSelectedQuality(nextQuality);
    if (hlsRef.current) hlsRef.current.currentLevel = nextQuality;
  };

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !canSeek) return;
    video.currentTime = (Number(event.target.value) / 100) * duration;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) container.requestFullscreen().catch(console.error);
    else document.exitFullscreen().catch(console.error);
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-black text-white group/player">
      {format === "iframe" ? (
        <iframe ref={iframeRef} src={activeUrl} title={`${channel.name} player`} className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      ) : (
        <video ref={videoRef} className="h-full w-full bg-black object-contain" />
      )}

      {(isLoading || statusMessage) && !error && format !== "iframe" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-center">
          <div>
            <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm font-bold text-white">{statusMessage || "Loading stream…"}</p>
            <p className="mt-1 text-xs text-zinc-400">Format: {formatLabel(format)} · Source {sourceIndex + 1}/{sources.length}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center">
          <div className="max-w-sm rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
            <p className="font-black text-white">{error}</p>
            <p className="mt-2 text-xs text-zinc-400">Format: {formatLabel(format)} · {channel.name}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button onClick={retryCurrentSource} className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase text-black hover:bg-zinc-200">Retry</button>
              {canTryBackup && <button onClick={tryNextSource} className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-red-700">Try Backup</button>}
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-100 transition-opacity md:opacity-0 md:group-hover/player:opacity-100">
        {!isMini && format !== "iframe" && (
          <input type="range" min="0" max="100" value={progress} disabled={!canSeek} onChange={seek} className="mb-3 w-full accent-red-600 disabled:opacity-40" aria-label="Playback position" />
        )}

        <div className="flex items-center gap-2">
          {format !== "iframe" && (
            <>
              <button onClick={togglePlay} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button onClick={toggleMute} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              {!isMini && <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="hidden w-24 accent-red-600 sm:block" aria-label="Volume" />}
            </>
          )}

          <div className="min-w-0 flex-1 px-2">
            <p className="truncate text-xs font-black uppercase tracking-wider">{channel.name}</p>
            <p className="text-[10px] text-zinc-400">Format: {formatLabel(format)} · Source {sourceIndex + 1}/{sources.length}{format !== "iframe" ? ` · ${isLiveStream ? "LIVE" : `${formatTime(currentTime)} / ${formatTime(duration)}`}` : ""}</p>
          </div>

          {!isMini && format === "hls" && qualityLevels.length > 0 && (
            <select value={selectedQuality} onChange={handleQualityChange} className="hidden rounded-lg border border-white/10 bg-black/70 px-2 py-1 text-xs text-white sm:block" aria-label="Video quality">
              <option value={-1}>Auto</option>
              {qualityLevels.map((level) => <option key={level.index} value={level.index}>{level.label}</option>)}
            </select>
          )}

          {canTryBackup && !isMini && <button onClick={tryNextSource} className="hidden rounded-lg bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-white/20 sm:block">Backup</button>}

          <button onClick={toggleFullscreen} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Toggle fullscreen">
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
