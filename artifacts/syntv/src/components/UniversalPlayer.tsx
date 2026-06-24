import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const CONTROLS_HIDE_DELAY_MS = 4000;
const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2];

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

function directUnsupportedMessage(format: StreamFormat) {
  if (format === "mpegts") return "This MPEG-TS stream may not play in your browser. Try an HLS backup.";
  if (format === "mkv") return "This MKV stream may not play in your browser. Try an HLS or MP4 backup.";
  return "This stream format may not be supported by your browser. Try a backup source.";
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

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable;
}

export default function UniversalPlayer({ url, channel, isMini = false }: UniversalPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<DashPlayer | null>(null);
  const retryCountRef = useRef(0);
  const controlsTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const playbackChannel = getPlaybackChannel(channel);
  const sources = useMemo(() => uniqueSources(url, playbackChannel.backupUrls), [url, playbackChannel.backupUrls]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const activeUrl = sources[sourceIndex] || url;
  const format = detectStreamFormat(activeUrl, playbackChannel.format || sourceTypeToFormat(playbackChannel.sourceType));

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(format === "hls" || format === "dash");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Loading stream…");
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState(-1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);

  const canTryBackup = sourceIndex < sources.length - 1;
  const canSeek = Number.isFinite(duration) && duration > 0 && !isLiveStream;
  const isIframe = format === "iframe";
  const progress = canSeek ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 100;
  const controlsShouldShow = isControlsVisible || isLoading || isBuffering || Boolean(errorMessage) || isMini;
  const supportsPiP = !isIframe && typeof document !== "undefined" && Boolean(document.pictureInPictureEnabled);

  const safeSetStatus = useCallback((message: string) => {
    if (mountedRef.current) setStatusMessage(message);
  }, []);

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

  const resetPlaybackState = useCallback(() => {
    retryCountRef.current = 0;
    setErrorMessage(null);
    setIsLoading(true);
    setIsBuffering(false);
    setStatusMessage("Loading stream…");
    setQualityLevels([]);
    setSelectedQuality(-1);
    setCurrentTime(0);
    setDuration(0);
    setIsLiveStream(format === "hls" || format === "dash");
  }, [format]);

  const showControls = useCallback((persist = false) => {
    setIsControlsVisible(true);
    if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    if (!persist && !isMini && !errorMessage && !isLoading) {
      controlsTimerRef.current = window.setTimeout(() => setIsControlsVisible(false), CONTROLS_HIDE_DELAY_MS);
    }
  }, [errorMessage, isLoading, isMini]);

  const switchSource = useCallback((index: number) => {
    retryCountRef.current = 0;
    setErrorMessage(null);
    setIsLoading(true);
    setIsBuffering(false);
    setStatusMessage(index === 0 ? "Loading primary source…" : `Trying backup source ${index}…`);
    setSourceIndex(Math.min(Math.max(index, 0), sources.length - 1));
    showControls(true);
  }, [showControls, sources.length]);

  const tryNextSource = useCallback(() => {
    if (!canTryBackup) {
      setErrorMessage("All stream sources failed. Please report this channel.");
      setIsLoading(false);
      setIsBuffering(false);
      showControls(true);
      return;
    }
    switchSource(sourceIndex + 1);
  }, [canTryBackup, showControls, sourceIndex, switchSource]);

  const retryCurrentSource = useCallback(() => {
    retryCountRef.current = 0;
    setErrorMessage(null);
    setIsLoading(true);
    setIsBuffering(false);
    setStatusMessage("Retrying stream…");
    showControls(true);

    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => setIsPlaying(false));
    }
  }, [showControls]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || errorMessage || isIframe) return;
    if (video.paused) video.play().catch(() => setIsPlaying(false));
    else video.pause();
    showControls();
  }, [errorMessage, isIframe, showControls]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video || isIframe) return;
    video.muted = !(video.muted || video.volume === 0);
    if (!video.muted && video.volume === 0) video.volume = 0.5;
    showControls();
  }, [isIframe, showControls]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) container.requestFullscreen().catch(console.error);
    else document.exitFullscreen().catch(console.error);
    showControls(true);
  }, [showControls]);

  const togglePictureInPicture = useCallback(async () => {
    const video = videoRef.current as (HTMLVideoElement & { requestPictureInPicture?: () => Promise<PictureInPictureWindow> }) | null;
    if (!video || !supportsPiP) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (video.requestPictureInPicture) await video.requestPictureInPicture();
    } catch (error) {
      console.warn("Picture-in-picture failed", error);
    }
    showControls();
  }, [showControls, supportsPiP]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setSourceIndex(0);
    resetPlaybackState();
  }, [resetPlaybackState, url]);

  useEffect(() => {
    if (isIframe) {
      destroyPlayers();
      setIsLoading(false);
      setIsBuffering(false);
      setErrorMessage(activeUrl ? null : "Invalid iframe URL.");
      setStatusMessage("");
      showControls(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    destroyPlayers();
    resetPlaybackState();
    setStatusMessage(sourceIndex === 0 ? "Loading stream…" : `Trying backup source ${sourceIndex}…`);

    video.controls = false;
    video.autoplay = true;
    video.playsInline = true;
    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;

    const updateDuration = () => {
      const nextDuration = video.duration;
      setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
      setIsLiveStream(!Number.isFinite(nextDuration) || nextDuration === Infinity || format === "hls" || format === "dash");
    };

    const handleLoaded = () => {
      updateDuration();
      setIsLoading(false);
      setIsBuffering(false);
      setStatusMessage("");
      showControls();
    };
    const handleWaiting = () => {
      setIsBuffering(true);
      safeSetStatus("Buffering…");
      showControls(true);
    };
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setIsBuffering(false);
      setStatusMessage("");
    };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolume = () => {
      setVolume(video.volume);
      setIsMuted(video.muted || video.volume === 0);
    };
    const handleRateChange = () => setPlaybackRate(video.playbackRate || 1);
    const handleVideoError = () => {
      if (canTryBackup) {
        setStatusMessage(`${formatLabel(format)} stream is unavailable. Trying backup source…`);
        tryNextSource();
        return;
      }
      setErrorMessage(format === "unknown" ? "Unsupported stream format. Please add a format or use an HLS/MP4/DASH link." : directUnsupportedMessage(format));
      setIsLoading(false);
      setIsBuffering(false);
      showControls(true);
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("canplay", handleLoaded);
    video.addEventListener("durationchange", updateDuration);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("stalled", handleWaiting);
    video.addEventListener("volumechange", handleVolume);
    video.addEventListener("ratechange", handleRateChange);
    video.addEventListener("error", handleVideoError);

    if (format === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, liveSyncDurationCount: 3, maxBufferLength: 30 });
        hlsRef.current = hls;
        hls.loadSource(activeUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls.levels.map((level, index) => ({ index, label: level.height ? `${level.height}p` : `Level ${index + 1}` }));
          setQualityLevels(levels);
          setIsLoading(false);
          setIsBuffering(false);
          setStatusMessage("");
          video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return;

          if (retryCountRef.current < MAX_RETRIES_PER_SOURCE) {
            retryCountRef.current += 1;
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setStatusMessage(`Network error. Retrying ${retryCountRef.current}/${MAX_RETRIES_PER_SOURCE}…`);
              hls.startLoad();
              return;
            }
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              setStatusMessage(`Media error. Recovering ${retryCountRef.current}/${MAX_RETRIES_PER_SOURCE}…`);
              hls.recoverMediaError();
              return;
            }
          }

          setStatusMessage("HLS stream is unavailable. Trying backup source…");
          tryNextSource();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = activeUrl;
        video.play().catch(() => setIsPlaying(false));
      } else {
        setErrorMessage("Your browser does not support HLS playback.");
        setIsLoading(false);
      }
    } else if (format === "dash") {
      loadDashJs()
        .then((dashjs) => {
          if (!mountedRef.current) return;
          const player = dashjs.MediaPlayer().create();
          dashRef.current = player;
          player.initialize(video, activeUrl, true);
          player.on?.("error", () => {
            setStatusMessage("DASH stream is unavailable. Trying backup source…");
            tryNextSource();
          });
          setIsLoading(false);
          setStatusMessage("");
        })
        .catch(() => {
          if (canTryBackup) tryNextSource();
          else {
            setErrorMessage("DASH stream is unavailable. Trying backup source failed.");
            setIsLoading(false);
          }
        });
    } else if (format === "mp4" || format === "mpegts" || format === "mkv") {
      video.src = activeUrl;
      video.play().catch(() => setIsPlaying(false));
    } else {
      setErrorMessage("Unsupported stream format. Please add a format or use an HLS/MP4/DASH link.");
      setIsLoading(false);
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("canplay", handleLoaded);
      video.removeEventListener("durationchange", updateDuration);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("stalled", handleWaiting);
      video.removeEventListener("volumechange", handleVolume);
      video.removeEventListener("ratechange", handleRateChange);
      video.removeEventListener("error", handleVideoError);
      destroyPlayers();
      video.removeAttribute("src");
      video.load();
    };
  }, [activeUrl, canTryBackup, destroyPlayers, format, isIframe, isMuted, playbackRate, resetPlaybackState, safeSetStatus, showControls, sourceIndex, tryNextSource, volume]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    const handlePiPEnter = () => setIsPictureInPicture(true);
    const handlePiPLeave = () => setIsPictureInPicture(false);
    const video = videoRef.current;
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    video?.addEventListener("enterpictureinpicture", handlePiPEnter);
    video?.addEventListener("leavepictureinpicture", handlePiPLeave);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      video?.removeEventListener("enterpictureinpicture", handlePiPEnter);
      video?.removeEventListener("leavepictureinpicture", handlePiPLeave);
    };
  }, []);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextVolume = Number(event.target.value);
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    showControls();
  };

  const handleQualityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextQuality = Number(event.target.value);
    setSelectedQuality(nextQuality);
    if (hlsRef.current) hlsRef.current.currentLevel = nextQuality;
    showControls();
  };

  const handleSourceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    switchSource(Number(event.target.value));
  };

  const handlePlaybackRateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextRate = Number(event.target.value);
    const video = videoRef.current;
    setPlaybackRate(nextRate);
    if (video) video.playbackRate = nextRate;
    showControls();
  };

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !canSeek) return;
    video.currentTime = (Number(event.target.value) / 100) * duration;
    showControls();
  };

  const seekBy = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video || !canSeek) return;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration);
    showControls();
  }, [canSeek, duration, showControls]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    if ([" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) event.preventDefault();

    switch (event.key.toLowerCase()) {
      case " ":
        togglePlay();
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "arrowleft":
        seekBy(-10);
        break;
      case "arrowright":
        seekBy(10);
        break;
      case "arrowup": {
        const video = videoRef.current;
        if (video) video.volume = Math.min(video.volume + 0.1, 1);
        break;
      }
      case "arrowdown": {
        const video = videoRef.current;
        if (video) video.volume = Math.max(video.volume - 0.1, 0);
        break;
      }
      case "p":
        togglePictureInPicture();
        break;
      case "escape":
        if (document.fullscreenElement) document.exitFullscreen().catch(console.error);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-black text-white outline-none group/player"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={() => showControls()}
      onTouchStart={() => showControls()}
      onFocus={() => showControls(true)}
      aria-label={`${channel.name} video player`}
    >
      {isIframe ? (
        <iframe src={activeUrl} title={`${channel.name} player`} className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      ) : (
        <video ref={videoRef} className="h-full w-full bg-black object-contain" />
      )}

      {(isLoading || isBuffering || statusMessage) && !errorMessage && !isIframe && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-center" role="status" aria-live="polite">
          <div className="rounded-2xl border border-white/10 bg-black/45 px-6 py-5 backdrop-blur-md">
            <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm font-bold text-white">{statusMessage || (isBuffering ? "Buffering…" : "Loading stream…")}</p>
            <p className="mt-1 text-xs text-zinc-400">Format: {formatLabel(format)} · Source {sourceIndex + 1}/{sources.length}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center" role="alert">
          <div className="max-w-sm rounded-2xl border border-red-500/25 bg-red-500/10 p-5 shadow-2xl backdrop-blur-md">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
            <p className="font-black text-white">{errorMessage}</p>
            <p className="mt-2 text-xs text-zinc-400">Format: {formatLabel(format)} · {channel.name}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button onClick={retryCurrentSource} className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase text-black hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-400">Retry</button>
              {canTryBackup && <button onClick={tryNextSource} className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400">Try Backup</button>}
              {sourceIndex > 0 && <button onClick={() => switchSource(0)} className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-red-400">Primary</button>}
            </div>
          </div>
        </div>
      )}

      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/65 to-transparent p-3 transition-opacity duration-300 ${controlsShouldShow ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {!isMini && !isIframe && (
          <input type="range" min="0" max="100" value={progress} disabled={!canSeek} onChange={seek} className="mb-3 w-full accent-red-600 disabled:opacity-40" aria-label="Playback position" />
        )}

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/35 p-2 backdrop-blur-md md:flex-nowrap">
          {!isIframe && (
            <>
              <button onClick={togglePlay} className="rounded-full bg-white/10 p-3 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 md:p-2" aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button onClick={toggleMute} className="rounded-full bg-white/10 p-3 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 md:p-2" aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              {!isMini && <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="hidden w-24 accent-red-600 sm:block" aria-label="Volume" />}
            </>
          )}

          <div className="min-w-0 flex-1 px-2">
            <p className="truncate text-xs font-black uppercase tracking-wider">{channel.name}</p>
            <p className="text-[10px] text-zinc-400">Format: {formatLabel(format)} · Source {sourceIndex + 1}/{sources.length}{!isIframe ? ` · ${isLiveStream ? "LIVE" : `${formatTime(currentTime)} / ${formatTime(duration)}`}` : ""}</p>
          </div>

          {!isMini && sources.length > 1 && (
            <select value={sourceIndex} onChange={handleSourceChange} className="max-w-[110px] rounded-lg border border-white/10 bg-black/70 px-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-400" aria-label="Source selector">
              {sources.map((source, index) => <option key={source} value={index}>{index === 0 ? "Primary" : `Backup ${index}`}</option>)}
            </select>
          )}

          {!isMini && format === "hls" && qualityLevels.length > 0 && (
            <select value={selectedQuality} onChange={handleQualityChange} className="max-w-[110px] rounded-lg border border-white/10 bg-black/70 px-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-400" aria-label="Video quality">
              <option value={-1}>Auto</option>
              {qualityLevels.map((level) => <option key={level.index} value={level.index}>{level.label}</option>)}
            </select>
          )}

          {!isMini && !isLiveStream && !isIframe && (
            <select value={playbackRate} onChange={handlePlaybackRateChange} className="rounded-lg border border-white/10 bg-black/70 px-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-400" aria-label="Playback speed">
              {PLAYBACK_RATES.map((rate) => <option key={rate} value={rate}>{rate}x</option>)}
            </select>
          )}

          {canTryBackup && !isMini && <button onClick={tryNextSource} className="hidden rounded-lg bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 sm:block">Backup</button>}
          {sourceIndex > 0 && !isMini && <button onClick={() => switchSource(0)} className="hidden rounded-lg bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 sm:block">Primary</button>}
          {supportsPiP && !isMini && <button onClick={togglePictureInPicture} className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-red-400" aria-label="Toggle picture in picture">{isPictureInPicture ? "Exit PiP" : "PiP"}</button>}

          <button onClick={toggleFullscreen} className="rounded-full bg-white/10 p-3 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 md:p-2" aria-label="Toggle fullscreen">
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
