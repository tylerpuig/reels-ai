import { create } from "zustand";

type VideoStore = {
  isCommentsVisible: boolean;
  setIsCommentsVisible: (open: boolean) => void;
  toggleIsCommentsVisible: () => void;
};

export const useVideoStore = create<VideoStore>((set) => ({
  isCommentsVisible: false,
  setIsCommentsVisible: (open) => set({ isCommentsVisible: open }),
  toggleIsCommentsVisible: () =>
    set((state) => ({ isCommentsVisible: !state.isCommentsVisible })),
}));
