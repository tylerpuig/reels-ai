import type React from "react";
import { SafeAreaView } from "react-native";
import { VideoScroll } from "@/components/video/VideoScroll";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <VideoScroll />
    </SafeAreaView>
  );
}
