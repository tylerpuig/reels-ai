import type React from "react";
import { SafeAreaView } from "react-native";
import { VideoScroll } from "@/components/video/VideoScroll";

const sampleVideos = [
  {
    id: "1",
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    username: "Sample User",
    description: "Big Buck Bunny - Sample Video",
  },
];
export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <VideoScroll videos={sampleVideos} />
    </SafeAreaView>
  );
}
