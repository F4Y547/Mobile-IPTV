import { createContext, useContext, useState, ReactNode } from "react";
import { Channel } from "@/data/channels";

type PlayerContextType = {
  currentChannel: Channel | null;
  playChannel: (channel: Channel) => void;
  stopChannel: () => void;
};

const PlayerContext = createContext<PlayerContextType>({
  currentChannel: null,
  playChannel: () => {},
  stopChannel: () => {},
});

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  
  const playChannel = (channel: Channel) => setCurrentChannel(channel);
  const stopChannel = () => setCurrentChannel(null);
  
  return (
    <PlayerContext.Provider value={{ currentChannel, playChannel, stopChannel }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}