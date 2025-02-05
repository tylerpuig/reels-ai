import { useState } from "react";
import { createContext, useContext } from "react";
import { VideoData } from "../trpc/types";

type VideoContextType = {
  currentVideo: VideoData | null;
  setCurrentVideo: React.Dispatch<React.SetStateAction<VideoData | null>>;
};

const VideoContext = createContext<VideoContextType>({
  currentVideo: null,
  setCurrentVideo: () => {},
});

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);

  return (
    <VideoContext.Provider value={{ currentVideo, setCurrentVideo }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideoContext() {
  return useContext(VideoContext);
}
