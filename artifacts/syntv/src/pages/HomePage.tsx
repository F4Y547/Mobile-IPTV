import Navbar from "@/components/Navbar";
import CategoryRow from "@/components/CategoryRow";
import { channels } from "@/data/channels";
import { Link } from "wouter";
import { Play } from "lucide-react";

export default function HomePage() {
  const categories = ["Sports", "Entertainment", "Movies", "Kids", "Documentary", "News", "Religious", "Music"];
  
  // Featured channel for hero
  const featuredChannel = channels.find(c => c.id === "t-sports");

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {/* Hero Section */}
      {featuredChannel && (
        <div className="relative h-[70vh] w-full flex items-center" data-testid="hero-section">
          {/* Abstract dark background since we don't have a specific hero image */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 to-blue-900/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 px-8 md:px-16 max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-500 tracking-widest uppercase">Featured Live</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
              {featuredChannel.name}
            </h1>
            
            <p className="text-xl text-zinc-300 mb-8 max-w-2xl leading-relaxed drop-shadow">
              Experience premium live sports action. Watch exclusive matches, highlights, and expert analysis in stunning HD quality.
            </p>
            
            <Link href={`/watch/${featuredChannel.id}`}>
              <button className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)]" data-testid="hero-watch-button">
                <Play className="w-6 h-6 fill-current" />
                WATCH NOW
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Category Rows */}
      <div className="-mt-16 relative z-20 flex flex-col gap-4">
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