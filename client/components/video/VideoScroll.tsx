import type React from "react";
import { useState } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { VideoItem } from "./VideoItem";

const { height } = Dimensions.get("window");

interface Video {
  id: string;
  url: string;
  username: string;
  description: string;
}

interface VideoScrollProps {
  videos: Video[];
}

export const VideoScroll: React.FC<VideoScrollProps> = ({ videos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.height;
    const index = event.nativeEvent.contentOffset.y / slideSize;
    const roundIndex = Math.round(index);

    setCurrentIndex(roundIndex);
  };

  return (
    <ScrollView
      className="flex-1 bg-black"
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {videos.map((video, index) => (
        <View key={video.id} style={{ height }}>
          <VideoItem video={video} isActive={index === currentIndex} />
        </View>
      ))}
    </ScrollView>
  );
};
