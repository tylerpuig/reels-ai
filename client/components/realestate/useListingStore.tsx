import { create } from "zustand";

type SelectedImage = {
  id: number;
  url: string;
};

type SelectedListingTab = "designer" | "3dviewer";

type ListingStore = {
  imageModalOpen: boolean;
  setImageModalOpen: (value: boolean) => void;
  selectedImage: SelectedImage | null;
  setSelectedImage: (value: SelectedImage | null) => void;
  generatedImage: string | null;
  setGeneratedImage: (value: string | null) => void;
  selectedTab: SelectedListingTab;
  setSelectedTab: (value: SelectedListingTab) => void;
};

export const useListingStore = create<ListingStore>()((set) => ({
  imageModalOpen: false,
  setImageModalOpen: (value) => set(() => ({ imageModalOpen: value })),
  selectedImage: null,
  setSelectedImage: (value) => set(() => ({ selectedImage: value })),
  generatedImage: null,
  setGeneratedImage: (value) => set(() => ({ generatedImage: value })),
  selectedTab: "designer",
  setSelectedTab: (value) => set(() => ({ selectedTab: value })),
}));
