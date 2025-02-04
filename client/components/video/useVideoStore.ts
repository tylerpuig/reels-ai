import { create } from "zustand";

type VideoStore = {
  isCommentsVisible: boolean;
  setIsCommentsVisible: (open: boolean) => void;
  toggleIsCommentsVisible: () => void;
  videoPaginationSkip: number;
  setVideoPaginationSkip: (skip: number) => void;
  activeVideoId: number;
  setActiveVideoId: (id: number) => void;
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
}));
