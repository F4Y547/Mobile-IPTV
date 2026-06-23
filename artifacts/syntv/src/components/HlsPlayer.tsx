import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Channel } from "@/data/channels";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HlsPlayerProps {
  url: string;
  channel: Channel;
  onClose?: () => void;
  isMini?: boolean;
}

export default function HlsPlayer({ url, channel, onClose, isMini = false }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);

    const initPlayer = () => {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
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
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          video.play().catch(console.error);
        });
        video.addEventListener("error", () => {
          setError("Stream is currently unavailable");
          setIsLoading(false);
        });
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    } else if (val === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-black flex flex-col justify-center items-center overflow-hidden w-full h-full ${
        isMini ? "" : "group"
      }`}
      data-testid="player-container"
    >
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-zinc-900/80 z-20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="font-semibold text-lg">{error}</p>
          <p className="text-zinc-400 text-sm mt-2 text-center max-w-md px-4">
            The stream for {channel.name} could not be loaded. It might be offline or geographically restricted.
          </p>
        </div>
      ) : isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : null}

      {!isMini && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <span className="live-badge animate-pulse">LIVE</span>
          <h2 className="text-white font-bold drop-shadow-md">{channel.name}</h2>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        onClick={isMini ? undefined : togglePlay}
        playsInline
        autoPlay
      />

      {!isMini && !error && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-red-500 transition">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-red-500 transition">
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/volume:w-24 group-hover/volume:opacity-100 transition-all duration-300 accent-red-600 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleFullscreen} className="text-white hover:text-red-500 transition">
              {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}