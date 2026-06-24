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

  const getInitials = (name: string) => {
    const cleaned = name
      .replace(/[+&]/g, " ")
      .replace(/\b(HD|TV|LIVE)\b/gi, "")
      .trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.slice(0, 2).map(word => word[0]).join("").toUpperCase();
  };

  const generatedLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=111827&color=ffffff&bold=true&format=svg`;
  const logoUrl = channel.logoUrl || generatedLogo;

  return (
    <div className={`overflow-hidden rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 shadow-inner ${sizeClasses[size]} ${className}`}>
      <img 
        src={logoUrl} 
        alt={`${channel.name} logo`} 
        className="w-full h-full object-contain p-1"
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
          (e.target as HTMLElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center font-black text-white" style="background: ${getGradient(channel.category)}">${getInitials(channel.name)}</div>`;
        }}
      />
    </div>
  );
}
