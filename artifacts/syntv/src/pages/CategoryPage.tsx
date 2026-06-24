import { useParams, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { allChannels as channels } from "@/data/allChannels";
import ChannelLogo from "@/components/ChannelLogo";
import NotFound from "./not-found";

export default function CategoryPage() {
  const { slug } = useParams();
  
  if (!slug) return <NotFound />;
  
  const categoryChannels = channels.filter(c => c.category.toLowerCase() === slug.toLowerCase());
  
  if (categoryChannels.length === 0) return <NotFound />;

  const categoryName = categoryChannels[0].category;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-6 md:mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">{categoryName} Channels</h1>
          <p className="text-zinc-400 text-sm md:text-base">Watch all live streams in the {categoryName} category.</p>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
          {categoryChannels.map(channel => (
            <Link key={channel.id} href={`/watch/${channel.id}`}>
              <div className="channel-card bg-card rounded-xl border border-card-border overflow-hidden flex flex-col items-center justify-center p-3 md:p-6 aspect-[3/4] relative">
                <div className="absolute top-1.5 right-1.5 z-10">
                  <span className="live-badge text-[9px] px-1.5 py-0.5">LIVE</span>
                </div>
                <ChannelLogo channel={channel} size="lg" className="mb-2 md:mb-4 shadow-xl" />
                <h3 className="text-center font-bold text-white text-[10px] md:text-sm line-clamp-2 w-full mt-1 md:mt-2">{channel.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
