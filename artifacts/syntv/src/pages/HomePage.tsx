import Navbar from "@/components/Navbar";
import CategoryRow from "@/components/CategoryRow";
import MatchScheduleBanner from "@/components/MatchScheduleBanner";
import { channels } from "@/data/channels";
import { Link } from "wouter";
import { Play, Sparkles, Trophy } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

export default function HomePage() {
  usePageMeta({
    title: "SYNTV Online | Live TV, Sports, News and World Cup Streams",
    description: "Watch live TV channels, sports, news, entertainment, kids content, documentaries and World Cup streams on SYNTV Online.",
  });

  const categories = ["Sports", "Entertainment", "Movies", "Kids", "Documentary", "News", "Religious", "Music"];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-[68vh] md:h-[78vh] w-full flex items-center overflow-hidden isolate" data-testid="hero-section">
        {/* Premium World Cup 2026 stadium background */}
        <div className="absolute inset-0 bg-[#030407]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,197,94,0.28),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(239,68,68,0.24),transparent_28%),radial-gradient(circle_at_55%_0%,rgba(250,204,21,0.16),transparent_36%),linear-gradient(135deg,rgba(3,7,18,0.25),rgba(3,7,18,0.95)_62%,rgba(2,6,23,1))]" />
        <div className="absolute inset-x-[-18%] top-[-44%] h-[72%] rounded-[100%] border-b border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_28%,transparent_66%)] blur-[1px]" />
        <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.20),rgba(255,255,255,0.05)_36%,transparent_72%)] opacity-60" />
        <div className="absolute left-[8%] top-8 h-64 w-24 rotate-12 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),rgba(255,255,255,0.10)_34%,transparent)] blur-2xl opacity-35" />
        <div className="absolute right-[10%] top-6 h-72 w-28 -rotate-12 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.50),rgba(250,204,21,0.12)_38%,transparent)] blur-2xl opacity-35" />
        <div className="absolute left-1/2 top-6 h-56 w-20 -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(239,68,68,0.38),rgba(255,255,255,0.08)_42%,transparent)] blur-2xl opacity-25" />

        {/* Pitch perspective and tournament pattern */}
        <div className="absolute inset-x-[-12%] bottom-[-34%] h-[62%] rotate-[-1deg] rounded-[100%_100%_0_0] border-t border-emerald-300/25 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18),rgba(5,46,22,0.14)_40%,transparent_72%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[48%] opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:84px_84px] [transform:perspective(700px)_rotateX(62deg)_translateY(58px)_scale(1.2)]" />
        <div className="absolute bottom-[18%] left-1/2 h-40 w-40 -translate-x-1/2 rounded-full border border-white/15 opacity-40" />
        <div className="absolute bottom-[18%] left-1/2 h-[1px] w-[120%] -translate-x-1/2 bg-white/10" />

        {/* Host-country ribbons */}
        <div className="absolute -left-28 top-16 h-[140%] w-28 rotate-12 bg-gradient-to-b from-emerald-500/0 via-emerald-400/20 to-emerald-500/0 blur-sm" />
        <div className="absolute right-6 top-0 h-[120%] w-20 -rotate-12 bg-gradient-to-b from-red-500/0 via-red-500/18 to-blue-500/0 blur-sm" />
        <div className="absolute right-[22%] bottom-10 h-36 w-36 rounded-full bg-yellow-400/10 blur-3xl" />

        {/* Premium floating match card */}
        <div className="absolute right-4 top-24 hidden w-[22rem] rotate-3 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:block">
          <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/45">
            <span>World Stage</span>
            <Sparkles className="h-4 w-4 text-yellow-300" />
          </div>
          <div className="grid grid-cols-3 items-center gap-3 text-center">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
              <p className="text-2xl">🇺🇸</p>
              <p className="mt-1 text-xs font-black text-white">USA</p>
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-white/50">2026</div>
            <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4">
              <p className="text-2xl">🇲🇽</p>
              <p className="mt-1 text-xs font-black text-white">MEX</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">Also hosted by</p>
            <p className="mt-1 text-lg font-black text-white">🇨🇦 Canada</p>
          </div>
        </div>

        {/* Trophy / ball halo */}
        <div className="absolute right-[8%] bottom-[12%] hidden h-64 w-64 items-center justify-center rounded-full border border-yellow-300/10 bg-yellow-300/[0.035] shadow-[0_0_120px_rgba(250,204,21,0.18)] md:flex">
          <div className="absolute inset-8 rounded-full border border-white/10" />
          <div className="absolute inset-16 rounded-full border border-emerald-300/10" />
          <Trophy className="h-24 w-24 text-yellow-300/20" />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(3,4,7,0.96)_0%,rgba(3,4,7,0.78)_36%,rgba(3,4,7,0.30)_68%,rgba(3,4,7,0.78)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.2px)] [background-size:22px_22px]" />

        <div className="relative z-10 px-5 md:px-16 max-w-5xl py-14 md:py-0">
          {/* Event badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.065] px-3.5 py-2 shadow-[0_0_40px_rgba(34,197,94,0.12)] backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-[10px] md:text-xs font-black text-white/85 tracking-[0.22em] uppercase">FIFA World Cup 2026 · Live HD</span>
          </div>

          {/* Title */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-yellow-200">
            <Trophy className="h-3.5 w-3.5" />
            USA · Canada · Mexico
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-1 tracking-tighter drop-shadow-2xl leading-none">
            FIFA World Cup
          </h1>
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-black mb-5 tracking-tighter leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-red-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.20)]">2026</span>
          </h2>

          <p className="text-sm md:text-lg text-zinc-200 mb-7 max-w-xl leading-relaxed">
            A cinematic football arena for the biggest tournament on Earth — stream the headline World Cup action live in HD on SYNTV.
          </p>

          {/* Stats row */}
          <div className="mb-7 grid w-full max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md">
            <div className="p-4">
              <p className="text-emerald-300 font-black text-xl md:text-2xl">48</p>
              <p className="text-zinc-400 uppercase tracking-wider text-[10px] md:text-xs">Teams</p>
            </div>
            <div className="border-x border-white/10 p-4">
              <p className="text-yellow-300 font-black text-xl md:text-2xl">104</p>
              <p className="text-zinc-400 uppercase tracking-wider text-[10px] md:text-xs">Matches</p>
            </div>
            <div className="p-4">
              <p className="text-red-300 font-black text-xl md:text-2xl">3</p>
              <p className="text-zinc-400 uppercase tracking-wider text-[10px] md:text-xs">Hosts</p>
            </div>
          </div>

          <Link href="/watch/fifa-wc-2026">
            <button
              className="group flex items-center gap-2 md:gap-3 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-400 px-7 py-3 md:px-10 md:py-4 text-base md:text-lg font-black uppercase tracking-wide text-white shadow-[0_0_45px_rgba(239,68,68,0.48)] transition-all hover:scale-105 hover:shadow-[0_0_70px_rgba(250,204,21,0.38)]"
              data-testid="hero-watch-button"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:scale-110">
                <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              </span>
              Watch Now
            </button>
          </Link>
        </div>
      </div>

      {/* Match Schedule Banner */}
      <MatchScheduleBanner />

      {/* Category Rows */}
      <div className="relative z-20 flex flex-col gap-2 md:gap-4 mt-2 md:mt-4">
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
