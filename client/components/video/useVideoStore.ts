import { create } from "zustand";
import { type VideoData } from "~/trpc/types";

type VideoStore = {
  isCommentsVisible: boolean;
  setIsCommentsVisible: (open: boolean) => void;
  toggleIsCommentsVisible: () => void;
  videoPaginationSkip: number;
  setVideoPaginationSkip: (skip: number) => void;
  activeVideoId: number;
  setActiveVideoId: (id: number) => void;
  selectedVideo: VideoData | null;
  setSelectedVideo: (video: VideoData | null) => void;
  isShareModalVisible: boolean;
  setIsShareModalVisible: (open: boolean) => void;
};

export const useVideoStore = create<VideoStore>((set) => ({
  isCommentsVisible: false,
  setIsCommentsVisible: (open) => set({ isCommentsVisible: open }),
  toggleIsCommentsVisible: () =>
    set((state) => ({ isCommentsVisible: !state.isCommentsVisible })),
  videoPaginationSkip: 0,
  setVideoPaginationSkip: (skip) => set({ videoPaginationSkip: skip }),
  activeVideoId: 0,
  setActiveVideoId: (id) => set({ activeVideoId: id }),
  selectedVideo: null,
  setSelectedVideo: (video) => set({ selectedVideo: video }),
  isShareModalVisible: false,
  setIsShareModalVisible: (open) => set({ isShareModalVisible: open }),
}));
