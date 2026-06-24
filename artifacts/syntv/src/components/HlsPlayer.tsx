import { ChangeEvent, PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Channel } from "@/data/channels";
import { AlertCircle, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";

interface HlsPlayerProps {
  url: string;
  channel: Channel;
  onClose?: () => void;
  isMini?: boolean;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SEEK_SECONDS = 10;

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});

function formatDuration(time: number) {
  if (!Number.isFinite(time) || time < 0) return "0:00";

  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);

  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  }

  return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function getTimelinePercent(event: PointerEvent<HTMLDivElement> | PointerEvent<Element>, element: HTMLDivElement) {
  const rect = element.getBoundingClientRect();
  return clamp((event.clientX - rect.left) / rect.width);
}

export default function HlsPlayer({ url, channel, isMini = false }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [hasCaptions, setHasCaptions] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [previewPercent, setPreviewPercent] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const canSeek = useMemo(
    () => Number.isFinite(duration) && duration > 0 && !isLiveStream,
    [duration, isLiveStream]
  );

  const progressPercent = useMemo(() => {
    if (!canSeek) return 100;
    return clamp(currentTime / duration) * 100;
  }, [canSeek, currentTime, duration]);

  const volumeLevel = isMuted || volume === 0 ? "muted" : volume >= 0.5 ? "high" : "low";

  const syncTextTracks = useCallback((enabled: boolean) => {
    const video = videoRef.current;
    if (!video) return;

    for (const track of Array.from(video.textTracks)) {
      track.mode = enabled ? "showing" : "hidden";
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    setIsLiveStream(false);
    setHasCaptions(false);
    setCaptionsEnabled(false);

    video.controls = false;
    video.autoplay = true;
    video.playsInline = true;
    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;

    const updateDurationState = () => {
      const nextDuration = video.duration;
      setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
      setIsLiveStream(!Number.isFinite(nextDuration) || nextDuration === Infinity);
      setHasCaptions(video.textTracks.length > 0);
    };

    const handleLoadedMetadata = () => {
      updateDurationState();
      setIsLoading(false);
    };

    const handleLoadedData = () => {
      updateDurationState();
      setIsLoading(false);
    };

    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const handleDurationChange = () => updateDurationState();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted || video.volume === 0);
    };
    const handleRateChange = () => setPlaybackRate(video.playbackRate || 1);
    const handleVideoError = () => {
      setError("Stream is currently unavailable");
      setIsLoading(false);
    };
    const handleEnterPictureInPicture = () => setIsPictureInPicture(true);
    const handleLeavePictureInPicture = () => setIsPictureInPicture(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("ratechange", handleRateChange);
    video.addEventListener("error", handleVideoError);
    video.addEventListener("enterpictureinpicture", handleEnterPictureInPicture);
    video.addEventListener("leavepictureinpicture", handleLeavePictureInPicture);

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 3,
      });

      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
        setIsLiveStream(Boolean(data.details?.live));
        updateDurationState();
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            setError("Stream is currently unavailable");
            setIsLoading(false);
            hls.destroy();
            break;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(() => setIsPlaying(false));
    } else {
      setError("Your browser does not support HLS playback.");
      setIsLoading(false);
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("ratechange", handleRateChange);
      video.removeEventListener("error", handleVideoError);
      video.removeEventListener("enterpictureinpicture", handleEnterPictureInPicture);
      video.removeEventListener("leavepictureinpicture", handleLeavePictureInPicture);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || error) return;

    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [error]);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video || !canSeek) return;

    video.currentTime = clamp(video.currentTime + seconds, 0, duration);
  }, [canSeek, duration]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const shouldMute = !(video.muted || video.volume === 0);
    video.muted = shouldMute;
    if (!shouldMute && video.volume === 0) video.volume = 0.5;
  }, []);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const nextVolume = Number(event.target.value);
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
  };

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  const togglePictureInPicture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const pictureInPictureDocument = document as Document & {
      pictureInPictureElement?: Element | null;
      exitPictureInPicture?: () => Promise<void>;
    };
    const pictureInPictureVideo = video as HTMLVideoElement & {
      requestPictureInPicture?: () => Promise<unknown>;
    };

    if (!pictureInPictureVideo.requestPictureInPicture || !pictureInPictureDocument.exitPictureInPicture) return;

    if (pictureInPictureDocument.pictureInPictureElement) {
      pictureInPictureDocument.exitPictureInPicture().catch(console.error);
    } else {
      pictureInPictureVideo.requestPictureInPicture().catch(console.error);
    }
  }, []);

  const toggleCaptions = useCallback(() => {
    if (!hasCaptions) return;

    setCaptionsEnabled((enabled) => {
      const nextValue = !enabled;
      syncTextTracks(nextValue);
      return nextValue;
    });
  }, [hasCaptions, syncTextTracks]);

  const changePlaybackSpeed = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentIndex = PLAYBACK_RATES.indexOf(video.playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length] || 1;
    video.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  }, []);

  const seekToPercent = useCallback((percent: number) => {
    const video = videoRef.current;
    if (!video || !canSeek) return;

    video.currentTime = percent * duration;
  }, [canSeek, duration]);

  const handleTimelineMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !canSeek) return;

    const percent = getTimelinePercent(event, timelineRef.current);
    setPreviewPercent(percent);
    if (isScrubbing) seekToPercent(percent);
  };

  const handleTimelineDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !canSeek) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsScrubbing(true);
    seekToPercent(getTimelinePercent(event, timelineRef.current));
  };

  const handleTimelineUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !canSeek) return;

    setIsScrubbing(false);
    seekToPercent(getTimelinePercent(event, timelineRef.current));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const tagName = activeElement?.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") return;

      switch (event.key.toLowerCase()) {
        case " ":
          if (tagName === "button") return;
          event.preventDefault();
          togglePlay();
          break;
        case "k":
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "t":
          if (!isMini) setIsTheater((value) => !value);
          break;
        case "i":
          togglePictureInPicture();
          break;
        case "c":
          toggleCaptions();
          break;
        case "j":
        case "arrowleft":
          event.preventDefault();
          skip(-SEEK_SECONDS);
          break;
        case "l":
        case "arrowright":
          event.preventDefault();
          skip(SEEK_SECONDS);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMini, skip, toggleCaptions, toggleFullscreen, toggleMute, togglePictureInPicture, togglePlay]);

  const containerModeClasses = isTheater && !isMini
    ? "fixed inset-x-0 top-0 z-[100] h-[72vh] rounded-none border-x-0 border-t-0 md:top-16 md:h-[calc(100vh-4rem)] md:rounded-b-2xl"
    : "h-full rounded-xl";

  const controlsVisibilityClasses = isPlaying && !error
    ? "opacity-0 group-hover/player:opacity-100 group-focus-within/player:opacity-100"
    : "opacity-100";

  return (
    <div
      ref={containerRef}
      className={`youtube-player-clone group/player relative flex w-full flex-col items-center justify-center overflow-hidden bg-black text-white shadow-2xl ${containerModeClasses}`}
      data-testid="player-container"
      data-volume-level={volumeLevel}
      data-paused={!isPlaying}
      data-live={isLiveStream}
    >
      {error ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/90 px-4 text-center text-white">
          <AlertCircle className="mb-4 h-10 w-10 text-red-500 md:h-12 md:w-12" />
          <p className="text-base font-bold md:text-lg">{error}</p>
          <p className="mt-2 max-w-md text-xs text-zinc-400 md:text-sm">
            The stream for {channel.name} could not be loaded. It might be offline or geographically restricted.
          </p>
        </div>
      ) : null}

      {isLoading && !error ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
          <div className="h-10 w-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Loading stream</p>
        </div>
      ) : null}

      {!isMini && !error ? (
        <div className={`pointer-events-none absolute left-0 right-0 top-0 z-20 bg-gradient-to-b from-black/80 via-black/25 to-transparent p-3 transition-opacity duration-200 md:p-4 ${controlsVisibilityClasses}`}>
          <div className="flex items-center gap-3">
            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">LIVE</span>
            <h2 className="truncate text-sm font-bold drop-shadow md:text-base">{channel.name}</h2>
          </div>
        </div>
      ) : null}

      <video
        ref={videoRef}
        className="h-full w-full bg-black object-contain"
        onClick={isMini ? undefined : togglePlay}
        playsInline
        autoPlay
      />

      {!isMini && !error ? (
        <div className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/65 to-transparent px-2 pb-2 pt-12 transition-opacity duration-200 md:px-4 md:pb-3 ${controlsVisibilityClasses}`}>
          <div
            ref={timelineRef}
            className={`relative mb-2 h-5 ${canSeek ? "cursor-pointer" : "cursor-default"}`}
            onPointerEnter={() => setIsPreviewing(true)}
            onPointerLeave={() => {
              setIsPreviewing(false);
              setIsScrubbing(false);
            }}
            onPointerMove={handleTimelineMove}
            onPointerDown={handleTimelineDown}
            onPointerUp={handleTimelineUp}
            role="slider"
            aria-label="Video timeline"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, duration)}
            aria-valuenow={currentTime}
          >
            {canSeek && isPreviewing ? (
              <div
                className="pointer-events-none absolute -top-8 rounded bg-black/90 px-2 py-1 text-[10px] font-bold text-white shadow-lg ring-1 ring-white/10"
                style={{ left: `${previewPercent * 100}%`, transform: "translateX(-50%)" }}
              >
                {formatDuration(previewPercent * duration)}
              </div>
            ) : null}
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-all group-hover/player:h-1.5">
              {!canSeek ? (
                <div className="h-full w-full bg-gradient-to-r from-red-700 via-red-500 to-red-700 animate-pulse" />
              ) : (
                <>
                  <div className="h-full bg-white/35" style={{ width: `${previewPercent * 100}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-red-600" style={{ width: `${progressPercent}%` }} />
                </>
              )}
            </div>
            {canSeek ? (
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-red-600 shadow transition-transform group-hover/player:scale-100"
                style={{ left: `${progressPercent}%` }}
              />
            ) : null}
          </div>

          <div className="flex items-center gap-2 text-white md:gap-3">
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </button>

            <div className="group/volume flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="h-1 w-0 cursor-pointer accent-red-600 opacity-0 transition-all duration-200 group-hover/volume:w-20 group-hover/volume:opacity-100 focus:w-20 focus:opacity-100 md:group-hover/volume:w-24 md:focus:w-24"
                aria-label="Volume"
              />
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-1 text-[11px] font-semibold tabular-nums text-zinc-200 md:text-xs">
              {canSeek ? (
                <>
                  <span>{formatDuration(currentTime)}</span>
                  <span className="text-zinc-500">/</span>
                  <span>{formatDuration(duration)}</span>
                </>
              ) : (
                <span className="inline-flex items-center gap-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <button
              onClick={toggleCaptions}
              disabled={!hasCaptions}
              className={`hidden h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-black transition hover:bg-white/10 md:flex ${captionsEnabled ? "border-b-2 border-red-600 text-white" : "text-white"} ${!hasCaptions ? "cursor-not-allowed opacity-40" : ""}`}
              aria-label="Captions"
              title={hasCaptions ? "Captions" : "No captions available"}
            >
              CC
            </button>

            <button
              onClick={changePlaybackSpeed}
              className="hidden h-9 min-w-11 items-center justify-center rounded-full px-2 text-xs font-black text-white transition hover:bg-white/10 sm:flex"
              aria-label="Playback speed"
              title="Playback speed"
            >
              {playbackRate}x
            </button>

            <button
              onClick={togglePictureInPicture}
              className={`hidden h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:flex ${isPictureInPicture ? "bg-white/15" : ""}`}
              aria-label="Mini player"
              title="Mini player"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="currentColor" d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H3V5h18v14Zm-10-7h9v6h-9v-6Z" />
              </svg>
            </button>

            <button
              onClick={() => setIsTheater((value) => !value)}
              className={`hidden h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:flex ${isTheater ? "bg-white/15" : ""}`}
              aria-label="Theater mode"
              title="Theater mode"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="currentColor" d={isTheater ? "M19 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm0 8H5V9h14v6Z" : "M19 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm0 10H5V8h14v8Z"} />
              </svg>
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
