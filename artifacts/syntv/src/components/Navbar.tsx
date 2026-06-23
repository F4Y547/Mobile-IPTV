import { Link } from "wouter";
import syntvLogo from "@assets/421-removebg-preview_1782241563235.png";
import { Search } from "lucide-react";

export default function Navbar() {
  const categories = ["Sports", "Entertainment", "News", "Movies", "Kids", "Documentary", "Religious", "Music"];

  return (
    <nav className="sticky top-0 z-50 h-16 bg-black/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8" data-testid="navbar">
      <div className="flex items-center">
        <Link href="/">
          <img src={syntvLogo} alt="SYNTV Logo" className="h-10 cursor-pointer object-contain" />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <Link href="/">
          <span className="text-sm font-semibold text-zinc-300 hover:text-white transition cursor-pointer">Home</span>
        </Link>
        {categories.map(cat => (
          <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
            <span className="text-sm font-semibold text-zinc-300 hover:text-white transition cursor-pointer">{cat}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center">
        <Link href="/search">
          <button className="p-2 text-zinc-300 hover:text-white transition rounded-full hover:bg-white/10" data-testid="search-button">
            <Search className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </nav>
  );
}