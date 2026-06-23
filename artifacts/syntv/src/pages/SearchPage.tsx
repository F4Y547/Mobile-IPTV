import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { channels } from "@/data/channels";
import ChannelLogo from "@/components/ChannelLogo";
import { Search, Tv } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = query.trim() === "" 
    ? [] 
    : channels.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="relative mb-8 md:mb-12">
          <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 md:h-6 md:w-6 text-zinc-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="block w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-base md:text-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all shadow-inner"
            placeholder="Search channels or categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {query.trim() === "" ? (
          <div className="text-center py-16 md:py-20 opacity-50">
            <Tv className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-zinc-500" />
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">Find what you want to watch</h2>
            <p className="text-zinc-400 text-sm md:text-base">Search by channel name or category.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 md:py-20 opacity-50">
            <Search className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-zinc-500" />
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">No results found</h2>
            <p className="text-zinc-400 text-sm md:text-base">We couldn't find any channels matching "{query}".</p>
          </div>
        ) : (
          <div>
            <h2 className="text-base md:text-xl font-bold text-white mb-4 md:mb-6">Results ({results.length})</h2>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {results.map(channel => (
                <Link key={channel.id} href={`/watch/${channel.id}`}>
                  <div className="channel-card bg-card rounded-xl border border-card-border overflow-hidden flex flex-col items-center justify-center p-3 md:p-6 aspect-[3/4] relative">
                    <div className="absolute top-1.5 right-1.5 z-10">
                      <span className="live-badge text-[9px] px-1.5 py-0.5">LIVE</span>
                    </div>
                    <ChannelLogo channel={channel} size="lg" className="mb-2 md:mb-4 shadow-xl" />
                    <h3 className="text-center font-bold text-white text-[10px] md:text-sm line-clamp-2 w-full mt-1">{channel.name}</h3>
                    <p className="text-[9px] md:text-xs text-zinc-500 mt-0.5 uppercase tracking-wider">{channel.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
