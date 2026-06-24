import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { type Channel } from "@/data/channels";
import { allChannels as channels } from "@/data/allChannels";
import { getChannelMeta } from "@/data/channelMeta";
import UniversalPlayer from "@/components/UniversalPlayer";
import ChannelLogo from "@/components/ChannelLogo";
import BrokenChannelReport from "@/components/BrokenChannelReport";
import { usePlayer } from "@/context/PlayerContext";
import { checkChannelHealth, type ChannelHealth } from "@/lib/channelHealth";
import NotFound from "./not-found";
import { Play } from "lucide-react";

function HealthBadge({ channel }: { channel: Channel }) {
  const [status, setStatus] = useState<ChannelHealth | "checking">("checking");

  useEffect(() => {
    let mounted = true;
    setStatus("checking");
    checkChannelHealth(channel).then((nextStatus) => {
      if (mounted) setStatus(nextStatus);
    });
    return () => {
      mounted = false;
    };
  }, [channel]);

  const badge = {
    checking: "border-zinc-500/30 bg-zinc-500/15 text-zinc-200",
    online: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
    offline: "border-red-400/30 bg-red-500/15 text-red-300",
    unknown: "border-amber-400/30 bg-amber-500/15 text-amber-300",
  }[status];

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${badge}`}>
      {status === "checking" ? "Checking" : status}
    </span>
  );
}

export default function WatchPage() {
  const { channelId } = useParams();
  const { playChannel } = usePlayer();
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const [playerVisible, setPlayerVisible] = useState(true);

  const channel = channels.find(c => c.id === channelId);
  const playableChannel = useMemo(() => {
    if (!channel) return null;
    return { ...channel, ...getChannelMeta(channel.id) } as Channel;
  }, [channel]);

  useEffect(() => {
    if (channel) {
      playChannel(channel);
    }
  }, [channel, playChannel]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPlayerVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (playerWrapperRef.current) {
      observer.observe(playerWrapperRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!channel || !playableChannel) {
    return <NotFound />;
  }

  const relatedChannels = channels.filter(c => c.category === channel.category && c.id !== channel.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-[1600px] mx-auto p-3 sm:p-4 md:p-8 flex flex-col lg:flex-row gap-4 md:gap-8">
        <div className="flex-1 min-w-0">
          <div 
            ref={playerWrapperRef}
            className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800 relative z-10"
          >
            <UniversalPlayer url={playableChannel.url} channel={playableChannel} />
          </div>

          <div className="mt-4 md:mt-8 flex items-start gap-3 md:gap-6">
            <ChannelLogo channel={channel} size="lg" className="shrink-0 shadow-lg hidden sm:block" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{channel.name}</h1>
                <span className="live-badge shrink-0">LIVE</span>
                <HealthBadge channel={playableChannel} />
              </div>
              <span className="inline-block px-3 py-1 bg-zinc-800 text-zinc-300 text-xs md:text-sm font-semibold rounded mb-3 md:mb-4">
                {channel.category}
              </span>
              <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
                Currently streaming {channel.name} live on SYNTV Online. Enjoy premium quality content without interruptions. 
                Experience the best in {channel.category.toLowerCase()} entertainment.
              </p>
              <BrokenChannelReport channel={channel} />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <h3 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4 pl-2 border-l-4 border-red-600">More {channel.category}</h3>
          <div className="bg-card rounded-xl border border-card-border overflow-hidden">
            <div className="flex lg:hidden overflow-x-auto gap-3 p-3 scrollbar-hide">
              {relatedChannels.slice(0, 12).map(rc => (
                <Link key={rc.id} href={`/watch/${rc.id}`}>
                  <div className="flex-none flex flex-col items-center gap-2 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition w-20 cursor-pointer group">
                    <ChannelLogo channel={rc} size="sm" />
                    <HealthBadge channel={rc} />
                    <span className="text-white text-[10px] font-semibold text-center line-clamp-2 leading-tight group-hover:text-red-500 transition">{rc.name}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="hidden lg:flex flex-col max-h-[800px] overflow-y-auto scrollbar-hide">
              {relatedChannels.map(rc => (
                <Link key={rc.id} href={`/watch/${rc.id}`}>
                  <div className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 cursor-pointer transition border-b border-zinc-800/50 last:border-0 group">
                    <div className="relative">
                      <ChannelLogo channel={rc} size="sm" />
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate group-hover:text-red-500 transition">{rc.name}</h4>
                      <div className="mt-1 flex items-center gap-1.5">
                        <HealthBadge channel={rc} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!playerVisible && (
        <div className="mini-player-container shadow-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-8">
          <div className="flex h-[160px] sm:h-[180px] flex-col items-center justify-center bg-black p-4 text-center">
            <p className="text-sm font-black uppercase tracking-wider text-white">{channel.name}</p>
            <p className="mt-2 max-w-xs text-xs text-zinc-400">Player is active above. Return to the main player to avoid loading the same stream twice.</p>
            <button
              type="button"
              onClick={() => playerWrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="mt-4 rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700"
            >
              Return to Player
            </button>
          </div>
          <div className="px-3 py-2 bg-zinc-900 border-t border-zinc-800 truncate flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-white truncate">{channel.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
