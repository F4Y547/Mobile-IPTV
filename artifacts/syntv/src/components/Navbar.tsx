import { useState } from "react";
import { Link, useLocation } from "wouter";
import syntvLogo from "@assets/421-removebg-preview_1782241563235.png";
import { Search, Menu, X, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const categories = ["Sports", "Entertainment", "News", "Movies", "Kids", "Documentary", "Religious", "Music"];

  return (
    <>
      <nav className="sticky top-0 z-50 h-14 md:h-16 bg-black/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8" data-testid="navbar">
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 text-zinc-300 hover:text-white transition rounded-lg hover:bg-white/10"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/">
            <img src={syntvLogo} alt="SYNTV Logo" className="h-8 md:h-10 cursor-pointer object-contain" />
          </Link>
        </div>

        {/* Centre: desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/">
            <span className={`text-sm font-semibold transition cursor-pointer ${location === "/" ? "text-white" : "text-zinc-300 hover:text-white"}`}>Home</span>
          </Link>
          {categories.map(cat => (
            <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
              <span className="text-sm font-semibold text-zinc-300 hover:text-white transition cursor-pointer">{cat}</span>
            </Link>
          ))}
        </div>

        {/* Right: search */}
        <div className="flex items-center">
          <Link href="/search">
            <button className="p-2 text-zinc-300 hover:text-white transition rounded-full hover:bg-white/10" data-testid="search-button">
              <Search className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full bg-zinc-950 border-r border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <img src={syntvLogo} alt="SYNTV" className="h-8 object-contain" />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white transition rounded-lg hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-4">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <div className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition group">
                  <span className={`font-bold text-sm ${location === "/" ? "text-red-500" : "text-white"}`}>Home</span>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition" />
                </div>
              </Link>

              <div className="px-5 pt-4 pb-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Categories</p>
              </div>

              {categories.map(cat => (
                <Link key={cat} href={`/category/${cat.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition group">
                    <span className={`font-semibold text-sm ${location === `/category/${cat.toLowerCase()}` ? "text-red-500" : "text-zinc-200"}`}>{cat}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Live badge at bottom */}
            <div className="px-5 py-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>80+ channels streaming live</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
