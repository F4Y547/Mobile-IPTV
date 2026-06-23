import Navbar from "@/components/Navbar";
import CategoryRow from "@/components/CategoryRow";
import MatchScheduleBanner from "@/components/MatchScheduleBanner";
import { channels } from "@/data/channels";
import { Link } from "wouter";
import { Play } from "lucide-react";

export default function HomePage() {
  const categories = ["Sports", "Entertainment", "Movies", "Kids", "Documentary", "News", "Religious", "Music"];
  
  // Featured channel for hero — FIFA World Cup 2026
  const featuredChannel = channels.find(c => c.id === "fifa-wc-2026");

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full flex items-center overflow-hidden" data-testid="hero-section">
        {/* Stadium atmosphere gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/30 via-black to-red-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(22,101,52,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Decorative trophy/ball silhouette */}
        <div className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <span className="text-[28rem] leading-none">⚽</span>
        </div>

        {/* Decorative red/gold accent lines */}
        <div className="absolute left-0 top-1/4 w-1 h-32 bg-gradient-to-b from-transparent via-red-600 to-transparent" />
        <div className="absolute left-4 top-1/3 w-0.5 h-20 bg-gradient-to-b from-transparent via-red-500/50 to-transparent" />

        <div className="relative z-10 px-8 md:px-16 max-w-5xl">
          {/* Event badge */}
          <div className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-600/40 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-400 tracking-widest uppercase">Live Now — Official Broadcast</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl leading-none">
            FIFA World Cup
          </h1>
          <h2 className="text-6xl md:text-8xl font-black mb-5 tracking-tighter leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-yellow-400">2026</span>
          </h2>

          <p className="text-lg text-zinc-300 mb-8 max-w-xl leading-relaxed">
            The greatest football tournament on Earth. USA · Canada · Mexico — watch every match live in HD on SYNTV.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 mb-8 text-sm">
            <div>
              <p className="text-red-400 font-bold text-xl">48</p>
              <p className="text-zinc-500 uppercase tracking-wider text-xs">Teams</p>
            </div>
            <div className="w-px bg-zinc-800" />
            <div>
              <p className="text-red-400 font-bold text-xl">104</p>
              <p className="text-zinc-500 uppercase tracking-wider text-xs">Matches</p>
            </div>
            <div className="w-px bg-zinc-800" />
            <div>
              <p className="text-red-400 font-bold text-xl">3</p>
              <p className="text-zinc-500 uppercase tracking-wider text-xs">Countries</p>
            </div>
          </div>

          <Link href="/watch/fifa-wc-2026">
            <button
              className="flex items-center gap-3 px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.5)] uppercase tracking-wide"
              data-testid="hero-watch-button"
            >
              <Play className="w-6 h-6 fill-current" />
              Watch Now
            </button>
          </Link>
        </div>
      </div>

      {/* Match Schedule Banner */}
      <MatchScheduleBanner />

      {/* Category Rows */}
      <div className="relative z-20 flex flex-col gap-4 mt-4">
        {categories.map(category => {
          const categoryChannels = channels.filter(c => c.category === category);
          if (categoryChannels.length === 0) return null;
          
          return (
            <CategoryRow 
              key={category} 
              title={category} 
              channels={categoryChannels} 
            />
          );
        })}
      </div>
    </div>
  );
}