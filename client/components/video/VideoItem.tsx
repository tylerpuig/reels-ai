import type React from "react";
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Button } from "~/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";

interface VideoItemProps {
  video: {
    id: string;
    url: string;
    username: string;
    description: string;
  };
  isActive: boolean;
}

const { width, height } = Dimensions.get("window");
const videoSource =
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const VideoItem: React.FC<VideoItemProps> = ({ video, isActive }) => {
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  return (
    <View className="flex-1">
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
      {/* Container for overlays */}
      <View className="absolute inset-0">
        {/* Text container - moved higher from bottom */}
        <View className="absolute bottom-12 left-0 p-4 w-4/5">
          <Text className="text-white text-lg font-bold mb-2">
            {video.username}
          </Text>
          <Text className="text-white text-sm">{video.description}</Text>
        </View>

        {/* Interaction buttons - moved higher */}
        <View className="absolute right-2 bottom-32 items-center space-y-6">
          <Button variant="ghost" size="icon" className="bg-transparent">
            <Heart className="h-7 w-7 text-white" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-transparent">
            <MessageCircle className="h-7 w-7 text-white" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-transparent">
            <Share2 className="h-7 w-7 text-white" />
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  video: {
    width: width,
    height: height,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
