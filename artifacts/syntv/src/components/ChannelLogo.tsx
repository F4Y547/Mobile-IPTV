import { Channel } from "@/data/channels";

interface ChannelLogoProps {
  channel: Channel;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ChannelLogo({ channel, size = "md", className = "" }: ChannelLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-3xl",
  };

  const getGradient = (category: string) => {
    switch (category) {
      case "Sports": return "linear-gradient(135deg, #FF6B00, #FFB800)";
      case "Kids": return "linear-gradient(135deg, #7C3AED, #2563EB)";
      case "Entertainment": return "linear-gradient(135deg, #0891B2, #06B6D4)";
      case "News": return "linear-gradient(135deg, #991B1B, #DC2626)";
      case "Documentary": return "linear-gradient(135deg, #065F46, #059669)";
      case "Religious": return "linear-gradient(135deg, #92400E, #D97706)";
      case "Movies": return "linear-gradient(135deg, #6D28D9, #8B5CF6)";
      case "Music": return "linear-gradient(135deg, #DB2777, #EC4899)";
      default: return "linear-gradient(135deg, #374151, #6B7280)";
    }
  };

  if (channel.logoUrl) {
    return (
      <div className={`overflow-hidden rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 ${sizeClasses[size]} ${className}`}>
        <img 
          src={channel.logoUrl} 
          alt={channel.name} 
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
            (e.target as HTMLElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center font-bold text-white" style="background: ${getGradient(channel.category)}">${channel.name.substring(0, 2).toUpperCase()}</div>`;
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold text-white border border-zinc-800 shadow-inner ${sizeClasses[size]} ${className}`}
      style={{ background: getGradient(channel.category) }}
    >
      {channel.name.substring(0, 2).toUpperCase()}
    </div>
  );
}