import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Channel } from "@/data/channels";
import ChannelLogo from "./ChannelLogo";
import { checkChannelHealth, type ChannelHealth } from "@/lib/channelHealth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryRowProps {
  title: string;
  channels: Channel[];
  showAll?: boolean;
}

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
    checking: "bg-zinc-700 text-zinc-200",
    online: "bg-emerald-600 text-white",
    offline: "bg-red-700 text-white",
    unknown: "bg-amber-500 text-black",
  }[status];

  const label = status === "checking" ? "CHECK" : status.toUpperCase();

  return <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${badge}`}>{label}</span>;
}

export default function CategoryRow({ title, channels, showAll = true }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const clientWidth = scrollRef.current.clientWidth;
    const scrollAmount = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (channels.length === 0) return null;

  return (
    <div className="py-4 md:py-6 group/row" data-testid={`category-row-${title}`}>
      <div className="flex items-end justify-between mb-3 md:mb-4 px-4 md:px-8">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-white tracking-wide">{title}</h2>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{channels.length} channels</p>
        </div>
        {showAll && (
          <Link href={`/category/${title.toLowerCase()}`} className="text-xs md:text-sm font-semibold text-zinc-400 hover:text-red-500 transition">
            See All
          </Link>
        )}
      </div>

      <div className="relative">
        {showLeftArrow && (
          <button 
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 w-10 md:w-16 z-20 flex items-center justify-center bg-gradient-to-r from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            data-testid={`scroll-left-${title}`}
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
          </button>
        )}

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-3 md:gap-4 px-4 md:px-8 pb-3 md:pb-4 scrollbar-hide snap-x"
        >
          {channels.map((channel, idx) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="snap-start"
            >
              <Link href={`/watch/${channel.id}`}>
                <div className="channel-card flex-none w-[130px] h-[180px] md:w-[160px] md:h-[220px] bg-card rounded-xl border border-card-border overflow-hidden relative flex flex-col items-center justify-center p-3 md:p-4">
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    {channel.quality && <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-black text-white">{channel.quality}</span>}
                    <span className="live-badge">LIVE</span>
                  </div>
                  <div className="absolute left-2 top-2 z-10">
                    <HealthBadge channel={channel} />
                  </div>
                  <ChannelLogo channel={channel} size="lg" className="mb-3 md:mb-4 shadow-xl" />
                  <h3 className="text-center font-bold text-white text-xs md:text-sm line-clamp-2 w-full mt-1 md:mt-2">{channel.name}</h3>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-3 md:pb-4">
                    <span className="text-[10px] md:text-xs font-semibold text-red-500 uppercase tracking-wider">{channel.category}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {showRightArrow && (
          <button 
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 w-10 md:w-16 z-20 flex items-center justify-center bg-gradient-to-l from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            data-testid={`scroll-right-${title}`}
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
          </button>
        )}
      </div>
    </div>
  );
}
