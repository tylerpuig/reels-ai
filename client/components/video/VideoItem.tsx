import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  ViewToken,
  TouchableOpacity,
} from "react-native";
import { Button } from "~/components/ui/button";
import {
  Play,
  Pause,
  Heart,
  MessageCircle,
  Share2,
  House,
} from "lucide-react-native";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useVideoStore } from "./useVideoStore";
import { useRouter } from "expo-router";
import { FeedToggle } from "./FeedToggle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { type VideoData } from "~/trpc/types";
import { trpc } from "@/trpc/client";

const { width, height } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 49;

export function VideoFeed() {
  const { setActiveVideoId, videoPaginationSkip } = useVideoStore();
  const insets = useSafeAreaInsets();
  const containerHeight = height - TAB_BAR_HEIGHT - insets.top;

  const onViewableItemsChanged = useCallback(
    ({ changed }: { changed: ViewToken[] }) => {
      const changedItem = changed[0];
      if (changedItem?.isViewable && changedItem.item) {
        setActiveVideoId(changedItem.item.id);
      }
    },
    [setActiveVideoId]
  );

  const { data: videos } = trpc.videos.getVideos.useQuery({
    skip: videoPaginationSkip,
  });

  const renderItem = ({ item }: { item: VideoData }) => (
    <VideoItem video={item} isActive={true} />
  );

  return (
    <View style={{ flex: 1 }}>
      <FeedToggle />
      <FlatList
        data={videos ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        snapToInterval={containerHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />
    </View>
  );
}

interface VideoItemProps {
  video: VideoData;
  isActive: boolean;
}

function VideoItem({ video, isActive }: VideoItemProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const videoRef = React.useRef<ExpoVideo>(null);
  const [status, setStatus] = React.useState({});
  const { setIsCommentsVisible } = useVideoStore();
  const [isPaused, setIsPaused] = useState(!isActive);
  const [showPlayButton, setShowPlayButton] = useState(false);

  React.useEffect(() => {
    if (videoRef.current) {
      if (isActive && !isPaused) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, [isActive, isPaused]);

  // Update isPaused state when isActive changes
  // React.useEffect(() => {
  //   if (!isActive) {
  //     setIsPaused(true);
  //   }
  // }, [isActive]);

  const handleVideoPress = () => {
    setIsPaused(!isPaused);
    setShowPlayButton(true);
  };

  const styles = StyleSheet.create({
    container: {
      width: width,
      height: height - TAB_BAR_HEIGHT - insets.top,
      backgroundColor: "black",
    },
    video: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },
    overlayContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "space-between",
      flexDirection: "row",
      padding: 20,
    },
    textContainer: {
      flex: 1,
      justifyContent: "flex-end",
      paddingRight: 80,
      paddingBottom: 40,
    },
    buttonContainer: {
      position: "absolute",
      right: 16,
      bottom: 120,
      alignItems: "center",
      gap: 16,
      zIndex: 10,
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
    buttonText: {
      color: "white",
      fontSize: 12,
      marginTop: 4,
    },
    playButtonContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 5,
    },
    playButton: {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      padding: 20,
      borderRadius: 50,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleVideoPress}
        style={StyleSheet.absoluteFill}
      >
        <ExpoVideo
          ref={videoRef}
          style={styles.video}
          source={{ uri: video.videoUrl }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={isActive && !isPaused}
          onPlaybackStatusUpdate={setStatus}
        />
      </TouchableOpacity>

      {showPlayButton && (
        <View style={styles.playButtonContainer}>
          <View style={styles.playButton}>
            {isPaused ? (
              <Play color="white" size={48} />
            ) : (
              <Pause color="white" size={48} />
            )}
          </View>
        </View>
      )}

      <View style={styles.overlayContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.username}>{video.title}</Text>
          <Text style={styles.description}>{video.description}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/(modals)/viewprofile/[id]",
                params: { id: "1" },
              });
            }}
            style={{ alignItems: "center" }}
          >
            <Avatar alt="Zach Nugent's Avatar">
              <AvatarImage source={{ uri: "" }} />
              <AvatarFallback>
                <Text>ZN</Text>
              </AvatarFallback>
            </Avatar>
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Button variant="default" size="icon" className="bg-transparent">
              <Heart className="h-7 w-7 text-white" />
            </Button>
            <Text style={styles.buttonText}>{video.likeCount}</Text>
          </View>

          <View style={{ alignItems: "center" }}>
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
            <Text style={styles.buttonText}>{video.commentCount}</Text>
          </View>

          <Button
            onPress={() => {
              router.push({
                pathname: "/(modals)/listing/[id]",
                params: { id: "1" },
              });
            }}
            variant="default"
            size="icon"
            className="bg-transparent"
          >
            <Share2 className="h-7 w-7 text-white" />
          </Button>

          <Button
            onPress={() => {
              router.push({
                pathname: "/(modals)/listing/[id]",
                params: { id: "1" },
              });
            }}
            variant="default"
            size="icon"
            className="bg-transparent"
          >
            <House className="h-7 w-7 text-white" />
          </Button>
        </View>
      </View>
    </View>
  );
}
