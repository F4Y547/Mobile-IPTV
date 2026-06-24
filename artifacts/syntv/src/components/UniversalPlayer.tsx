import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Hls from "hls.js";
import * as dashjs from "dashjs";
import mpegts from "mpegts.js";
import type { Channel } from "@/data/channels";
import { detectStreamFormat, formatLabel, formatBadgeColor } from "@/lib/streamFormat";
import { channelMeta } from "@/data/channelMeta";
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  AlertCircle, RefreshCw, SkipForward, ChevronDown,
} from "lucide-react";

interface UniversalPlayerProps {
  url: string;
  channel: Channel;
  isMini?: boolean;
}

type HlsLevel = { height: number; bitrate: number; name: string };

export default function UniversalPlayer({ url, channel, isMini = false }: UniversalPlayerProps) {
  const meta = channelMeta[channel.id];

  // All available stream URLs — primary + backups
  const allUrls = useMemo(() => {
    const list = [url, ...(channel.backupUrls ?? meta?.backupUrls ?? [])].filter(Boolean);
    return [...new Set(list)]; // dedupe
  }, [url, channel.backupUrls, meta]);

  // ── Playback state ────────────────────────────────────────────────────────
  const [srcIdx, setSrcIdx]           = useState(0);
  const [retryKey, setRetryKey]       = useState(0);
  const [error, setError]             = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isPlaying, setIsPlaying]     = useState(true);
  const [isMuted, setIsMuted]         = useState(false);
  const [volume, setVolume]           = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hlsLevels, setHlsLevels]     = useState<HlsLevel[]>([]);
  const [hlsLevel, setHlsLevel]       = useState(-1); // -1 = auto

  // ── Refs ──────────────────────────────────────────────────────────────────
  const videoRef      = useRef<HTMLVideoElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const hlsRef        = useRef<Hls | null>(null);
  const dashRef       = useRef<dashjs.MediaPlayerClass | null>(null);
  const mpegtsRef     = useRef<mpegts.Player | null>(null);
  const srcIdxRef     = useRef(srcIdx);
  srcIdxRef.current   = srcIdx;
  const allUrlsRef    = useRef(allUrls);
  allUrlsRef.current  = allUrls;

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeUrl = allUrls[srcIdx] ?? url;
  const format    = detectStreamFormat(activeUrl, channel.format ?? meta?.format);
  const fmtLabel  = formatLabel(format);
  const fmtColor  = formatBadgeColor(format);

  // ── Cleanup all player instances ─────────────────────────────────────────
  const cleanupAll = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (dashRef.current) {
      try { dashRef.current.reset(); } catch {}
      dashRef.current = null;
    }
    if (mpegtsRef.current) {
      try { mpegtsRef.current.destroy(); } catch {}
      mpegtsRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
  }, []);

  // ── Advance to next source or show terminal error ─────────────────────────
  const handleStreamError = useCallback((msg: string) => {
    const nextIdx = srcIdxRef.current + 1;
    if (nextIdx < allUrlsRef.current.length) {
      setSrcIdx(nextIdx);
      setRetryKey(0);
    } else {
      setError(msg);
      setIsLoading(false);
    }
  }, []);

  // ── Manual retry (same URL) ───────────────────────────────────────────────
  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setRetryKey(k => k + 1);
  }, []);

  // ── Manual switch to next backup ─────────────────────────────────────────
  const tryNextSource = useCallback(() => {
    const nextIdx = srcIdxRef.current + 1;
    if (nextIdx < allUrlsRef.current.length) {
      setError(null);
      setIsLoading(true);
      setSrcIdx(nextIdx);
      setRetryKey(0);
    }
  }, []);

  // ── Main player init effect ───────────────────────────────────────────────
  useEffect(() => {
    setError(null);
    setIsLoading(true);
    setHlsLevels([]);
    setHlsLevel(-1);
    cleanupAll();

    const video = videoRef.current;

    // Iframe: no video element needed
    if (format === "iframe") {
      setIsLoading(false);
      return cleanupAll;
    }

    if (!video) return;

    // ── HLS (and unknown — default to HLS attempt) ────────────────────────
    if (format === "hls" || format === "unknown") {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
          backBufferLength: 10,
        });
        hlsRef.current = hls;
        hls.loadSource(activeUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels: HlsLevel[] = hls.levels.map((l, i) => ({
            height: l.height,
            bitrate: l.bitrate,
            name: l.height ? `${l.height}p` : `Level ${i + 1}`,
          }));
          setHlsLevels(levels);
          setIsLoading(false);
          video.play().catch(() => {});
        });

        let networkRetries = 0;
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return;
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (networkRetries < 2) {
                networkRetries++;
                hls.startLoad();
              } else {
                handleStreamError(
                  format === "unknown"
                    ? "Stream format unknown or unsupported. Trying next source…"
                    : "HLS stream unavailable. Trying backup source…"
                );
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              handleStreamError("HLS stream unavailable. Trying backup source…");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS — Safari
        video.src = activeUrl;
        const onLoaded = () => { setIsLoading(false); video.play().catch(() => {}); };
        const onError  = () => handleStreamError("HLS stream unavailable.");
        video.addEventListener("loadedmetadata", onLoaded, { once: true });
        video.addEventListener("error", onError, { once: true });
      } else {
        handleStreamError("HLS is not supported in this browser.");
      }
      return cleanupAll;
    }

    // ── DASH (.mpd) ───────────────────────────────────────────────────────
    if (format === "dash") {
      const player = dashjs.MediaPlayer().create();
      dashRef.current = player;
      player.initialize(video, activeUrl, true);
      player.on(dashjs.MediaPlayer.events.ERROR, () => {
        handleStreamError("DASH stream unavailable. Trying backup source…");
      });
      player.on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, () => {
        setIsLoading(false);
      });
      return cleanupAll;
    }

    // ── MPEG-TS (.ts) ─────────────────────────────────────────────────────
    if (format === "mpegts") {
      if (mpegts.getFeatureList().mseLivePlayback) {
        const player = mpegts.createPlayer(
          { type: "mpegts", url: activeUrl, isLive: true },
          { enableWorker: true }
        );
        mpegtsRef.current = player;
        player.attachMediaElement(video);
        player.load();
        player.on(mpegts.Events.ERROR, () => {
          handleStreamError(
            "MPEG-TS stream unavailable. This format may not be supported by your browser."
          );
        });
        const onCanPlay = () => { setIsLoading(false); video.play().catch(() => {}); };
        video.addEventListener("canplay", onCanPlay, { once: true });
      } else {
        // Fallback: try browser native playback
        video.src = activeUrl;
        const onCanPlay = () => { setIsLoading(false); video.play().catch(() => {}); };
        const onError   = () =>
          handleStreamError(
            "MPEG-TS stream is not supported by your browser. Try an HLS backup source."
          );
        video.addEventListener("canplay", onCanPlay, { once: true });
        video.addEventListener("error", onError, { once: true });
      }
      return cleanupAll;
    }

    // ── MP4 / direct video ────────────────────────────────────────────────
    if (format === "mp4") {
      video.src = activeUrl;
      const onCanPlay = () => { setIsLoading(false); video.play().catch(() => {}); };
      const onError   = () => handleStreamError("Video file unavailable.");
      video.addEventListener("canplay", onCanPlay, { once: true });
      video.addEventListener("error", onError, { once: true });
      return cleanupAll;
    }

    return cleanupAll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUrl, format, retryKey]);

  // ── Fullscreen listener ───────────────────────────────────────────────────
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ── Video playback event sync ─────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  // ── HLS quality change ────────────────────────────────────────────────────
  const changeHlsLevel = useCallback((level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setHlsLevel(level);
    }
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    isPlaying ? v.pause() : v.play().catch(() => {});
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    if (val === 0) { v.muted = true; setIsMuted(true); }
    else if (isMuted) { v.muted = false; setIsMuted(false); }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const hasMoreSources = srcIdx < allUrls.length - 1;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={`relative bg-black flex items-center justify-center overflow-hidden w-full h-full ${isMini ? "" : "group"}`}
      data-testid="player-container"
    >
      {/* ── Loading spinner ── */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Error overlay ── */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 z-20 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4 flex-shrink-0" />
          <p className="font-bold text-white text-base mb-1">{channel.name}</p>
          <p className="text-zinc-400 text-sm mb-6 max-w-xs leading-relaxed">{error}</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={retry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            {hasMoreSources && (
              <button
                onClick={tryNextSource}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-lg transition"
              >
                <SkipForward className="w-4 h-4" />
                Try Backup
              </button>
            )}
          </div>
          {allUrls.length > 1 && (
            <p className="mt-4 text-zinc-600 text-xs">
              Source {srcIdx + 1} of {allUrls.length}
            </p>
          )}
        </div>
      )}

      {/* ── Top-left: LIVE badge + channel name (non-mini) ── */}
      {!isMini && !error && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <span className="live-badge animate-pulse">LIVE</span>
          <span className="text-white text-sm font-semibold drop-shadow hidden sm:inline">
            {channel.name}
          </span>
        </div>
      )}

      {/* ── Top-right: Format badge + source counter ── */}
      {!isMini && !error && !isLoading && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={`${fmtColor} text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded`}>
            {fmtLabel}
          </span>
          {allUrls.length > 1 && (
            <span className="bg-black/70 text-zinc-300 text-[10px] font-semibold px-2 py-0.5 rounded">
              {srcIdx + 1}/{allUrls.length}
            </span>
          )}
        </div>
      )}

      {/* ── Iframe embed ── */}
      {format === "iframe" && (
        <iframe
          src={activeUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          title={channel.name}
        />
      )}

      {/* ── Video element (all non-iframe formats) ── */}
      {format !== "iframe" && (
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          onClick={isMini ? undefined : togglePlay}
          playsInline
          autoPlay
          muted={isMuted}
        />
      )}

      {/* ── Bottom controls bar (non-mini, non-error) ── */}
      {!isMini && !error && format !== "iframe" && (
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-between gap-4">
          {/* Left controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-400 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="text-white hover:text-red-400 transition">
                {isMuted || volume === 0
                  ? <VolumeX className="w-5 h-5" />
                  : <Volume2 className="w-5 h-5" />
                }
              </button>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 transition-all duration-200 accent-red-600 cursor-pointer"
                aria-label="Volume"
              />
            </div>

            {/* HLS quality selector */}
            {format === "hls" && hlsLevels.length > 1 && (
              <div className="relative group/quality">
                <button className="flex items-center gap-1 text-white hover:text-red-400 transition text-xs font-semibold">
                  {hlsLevel === -1 ? "AUTO" : hlsLevels[hlsLevel]?.name ?? "AUTO"}
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute bottom-full left-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden hidden group-hover/quality:block min-w-[80px] z-30">
                  <button
                    onClick={() => changeHlsLevel(-1)}
                    className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition ${hlsLevel === -1 ? "text-red-400 font-bold" : "text-white"}`}
                  >
                    Auto
                  </button>
                  {hlsLevels.map((lvl, i) => (
                    <button
                      key={i}
                      onClick={() => changeHlsLevel(i)}
                      className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition ${hlsLevel === i ? "text-red-400 font-bold" : "text-white"}`}
                    >
                      {lvl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {hasMoreSources && (
              <button
                onClick={tryNextSource}
                className="text-zinc-400 hover:text-white transition text-xs flex items-center gap-1"
                title="Try next source"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-400 transition"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
