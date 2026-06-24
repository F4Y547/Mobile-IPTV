import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Channel } from "@/data/channels";
import { AlertCircle, Maximize2, Minimize2, Pause, Play, RefreshCw, Volume2, VolumeX } from "lucide-react";

interface HlsPlayerProps {
  url: string;
  channel: Channel;
  onClose?: () => void;
  isMini?: boolean;
}

type QualityLevel = {
  index: number;
  label: string;
};

const MAX_RETRIES_PER_SOURCE = 2;

function extendedChannel(channel: Channel) {
  return channel as Channel & { backupUrls?: string[] };
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function uniqueSources(primary: string, backups?: string[]) {
  return Array.from(new Set([primary, ...(backups || [])].filter(Boolean)));
}

export default function HlsPlayer({ url, channel, isMini = false }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef(0);

  const sources = useMemo(() => uniqueSources(url, extendedChannel(channel).backupUrls), [url, channel]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Loading stream…");
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState(-1);

  const activeUrl = sources[sourceIndex] || url;
  const hasBackup = sources.length > 1;
  const canTryBackup = sourceIndex < sources.length - 1;
  const canSeek = Number.isFinite(duration) && duration > 0 && !isLiveStream;
  const progress = canSeek ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 100;

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const tryNextSource = useCallback(() => {
    if (!canTryBackup) {
      setError("All stream sources failed. Please try again later.");
      setIsLoading(false);
      return;
    }

    retryCountRef.current = 0;
    setError(null);
    setIsLoading(true);
    setStatusMessage("Primary stream unavailable. Trying backup source…");
    setSourceIndex((index) => Math.min(index + 1, sources.length - 1));
  }, [canTryBackup, sources.length]);

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
    if (!video) return;

    destroyHls();
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
      setIsLiveStream(!Number.isFinite(nextDuration) || nextDuration === Infinity);
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
      if (canTryBackup) {
        tryNextSource();
        return;
      }
      setError("Stream is currently unavailable.");
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
        const levels = hls.levels.map((level, index) => ({
          index,
          label: level.height ? `${level.height}p` : `Level ${index + 1}`,
        }));
        setQualityLevels(levels);
        setIsLoading(false);
        setStatusMessage("");
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
        setIsLiveStream(Boolean(data.details?.live));
        updateDuration();
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

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("durationchange", updateDuration);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolume);
      video.removeEventListener("error", handleVideoError);
      destroyHls();
      video.removeAttribute("src");
      video.load();
    };
  }, [activeUrl, canTryBackup, destroyHls, isMuted, sourceIndex, tryNextSource, volume]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || error) return;
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
      <video ref={videoRef} className="h-full w-full bg-black object-contain" />

      {(isLoading || statusMessage) && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-center">
          <div>
            <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm font-bold text-white">{statusMessage || "Loading stream…"}</p>
            {hasBackup && <p className="mt-1 text-xs text-zinc-400">Source {sourceIndex + 1} of {sources.length}</p>}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center">
          <div className="max-w-sm rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
            <p className="font-black text-white">{error}</p>
            <p className="mt-2 text-xs text-zinc-400">{channel.name}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button onClick={retryCurrentSource} className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase text-black hover:bg-zinc-200">
                Retry
              </button>
              {canTryBackup && (
                <button onClick={tryNextSource} className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-red-700">
                  Try Backup
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-100 transition-opacity md:opacity-0 md:group-hover/player:opacity-100">
        {!isMini && (
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            disabled={!canSeek}
            onChange={seek}
            className="mb-3 w-full accent-red-600 disabled:opacity-40"
            aria-label="Playback position"
          />
        )}

        <div className="flex items-center gap-2">
          <button onClick={togglePlay} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </button>

          <button onClick={toggleMute} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          {!isMini && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="hidden w-24 accent-red-600 sm:block"
              aria-label="Volume"
            />
          )}

          <div className="min-w-0 flex-1 px-2">
            <p className="truncate text-xs font-black uppercase tracking-wider">{channel.name}</p>
            <p className="text-[10px] text-zinc-400">{isLiveStream ? "LIVE" : `${formatTime(currentTime)} / ${formatTime(duration)}`} · Source {sourceIndex + 1}/{sources.length}</p>
          </div>

          {!isMini && qualityLevels.length > 0 && (
            <select
              value={selectedQuality}
              onChange={handleQualityChange}
              className="hidden rounded-lg border border-white/10 bg-black/70 px-2 py-1 text-xs text-white sm:block"
              aria-label="Video quality"
            >
              <option value={-1}>Auto</option>
              {qualityLevels.map((level) => (
                <option key={level.index} value={level.index}>{level.label}</option>
              ))}
            </select>
          )}

          {canTryBackup && !isMini && (
            <button onClick={tryNextSource} className="hidden rounded-lg bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-white/20 sm:block">
              Backup
            </button>
          )}

          <button onClick={toggleFullscreen} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Toggle fullscreen">
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
