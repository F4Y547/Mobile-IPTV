import { usePlayer } from "@/context/PlayerContext";
import HlsPlayer from "./HlsPlayer";
import { X, Maximize2 } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function MiniPlayer() {
  const { currentChannel, stopChannel } = usePlayer();
  const [location] = useLocation();

  // If on watch page for this channel, don't show the global mini player.
  // The watch page handles its own visibility via intersection observer
  const isWatchPageForCurrent = location === `/watch/${currentChannel?.id}`;
  
  if (!currentChannel || isWatchPageForCurrent) return null;

  return (
    <div className="mini-player-container group flex flex-col shadow-2xl border border-zinc-800">
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-semibold text-white px-2 py-0.5 bg-red-600 rounded">LIVE</span>
        <div className="flex items-center gap-1">
          <Link href={`/watch/${currentChannel.id}`}>
            <button className="p-1 rounded-full bg-black/50 text-white hover:bg-red-600 transition" title="Expand">
              <Maximize2 className="w-3 h-3" />
            </button>
          </Link>
          <button 
            onClick={stopChannel} 
            className="p-1 rounded-full bg-black/50 text-white hover:bg-red-600 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="w-full h-[180px] bg-black cursor-pointer" onClick={() => window.location.href = `/watch/${currentChannel.id}`}>
        <HlsPlayer url={currentChannel.url} channel={currentChannel} isMini={true} />
      </div>
      
      <div className="px-3 py-2 bg-zinc-900 border-t border-zinc-800 truncate flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-medium text-white truncate">{currentChannel.name}</span>
      </div>
    </div>
  );
}