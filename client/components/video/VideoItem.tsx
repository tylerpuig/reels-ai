import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  ViewToken,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Heart, MessageCircle, Share2, User2 } from "lucide-react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useVideoStore } from "./useVideoStore";

interface Video {
  id: string;
  url: string;
  username: string;
  description: string;
}

const { width, height } = Dimensions.get("window");

const videoSources: Video[] = [
  {
    id: "1",
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    username: "BigBuckBunny",
    description: "A large rabbit fights back against bullies in a forest.",
  },
  {
    id: "2",
    url: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    username: "Sintel",
    description: "A girl searches for a baby dragon she befriended.",
  },
];

export function VideoFeed() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ changed }: { changed: ViewToken[] }) => {
      const newActiveIndex = changed[0]?.index;
      if (newActiveIndex != null && newActiveIndex !== activeVideoIndex) {
        setActiveVideoIndex(newActiveIndex);
      }
    },
    [activeVideoIndex]
  );

  const renderItem = ({ item, index }: { item: Video; index: number }) => (
    <VideoItem video={item} isActive={index === activeVideoIndex} />
  );

  return (
    <FlatList
      data={videoSources}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      pagingEnabled
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
    />
  );
}

interface VideoItemProps {
  video: Video;
  isActive: boolean;
}

function VideoItem({ video, isActive }: VideoItemProps) {
  const { isCommentsVisible, setIsCommentsVisible } = useVideoStore();
  const player = useVideoPlayer(video.url, (player) => {
    player.loop = true;
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
      {/* Container for overlays */}
      <View style={styles.overlayContainer}>
        {/* Text container */}
        <View style={styles.textContainer}>
          <Text style={styles.username}>{video.username}</Text>
          <Text style={styles.description}>{video.description}</Text>
        </View>

        {/* Interaction buttons */}
        <View style={styles.buttonContainer}>
          <Avatar alt="Zach Nugent's Avatar">
            <AvatarImage source={{ uri: "" }} />
            <AvatarFallback>
              <Text>ZN</Text>
            </AvatarFallback>
          </Avatar>
          <Text className="text-white">Profile</Text>
          <Button variant="default" size="icon" className="bg-transparent">
            <Heart className="h-7 w-7 text-white" />
          </Button>
          <Text className="text-white">103k</Text>
          <Button
            onPress={() => {
              setIsCommentsVisible(true);
            }}
            variant="default"
            size="icon"
            className="bg-transparent"
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </Button>
          <Text className="text-white">826</Text>
          <Button variant="default" size="icon" className="bg-transparent">
            <Share2 className="h-7 w-7 text-white" />
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    top: -100,
    width: width,
    height: height - 100,
    backgroundColor: "black",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  textContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    padding: 16,
    width: "80%",
  },
  username: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    color: "white",
    fontSize: 14,
  },
  buttonContainer: {
    position: "absolute",
    right: 8,
    bottom: 120,
    alignItems: "center",
  },
});
