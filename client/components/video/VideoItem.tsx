import React, { useState, useCallback, useEffect } from "react";
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
import LikeButton from "./actions/LikeButton";
import VideoComments from "./actions/VideoComments";
import { useSessionStore } from "@/hooks/useSession";

const { width, height } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 49;

export function VideoFeed() {
  const { setSelectedVideo, videoPaginationSkip } = useVideoStore();
  const { session } = useSessionStore();
  const insets = useSafeAreaInsets();
  const containerHeight = height - TAB_BAR_HEIGHT - insets.top;
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const { data: videos } = trpc.videos.getVideos.useQuery(
    {
      skip: videoPaginationSkip,
      userId: session?.user?.id ?? "",
    },
    {
      staleTime: 0,
      cacheTime: 0,
    }
  );

  const onViewableItemsChanged = useCallback(
    ({ changed }: { changed: ViewToken[] }) => {
      const changedItem = changed[0];
      setSelectedVideoIndex(changedItem?.index ?? 0);

      // Update selected video whenever videos data changes
      if (videos?.[changedItem?.index ?? 0]) {
        setSelectedVideo(videos[changedItem?.index ?? 0]);
      }
    },
    [videos, setSelectedVideo]
  );

  const renderItem = ({ item, index }: { item: VideoData; index: number }) => {
    return <VideoItem video={item} isActive={selectedVideoIndex === index} />;
  };

  return (
    <View style={{ flex: 1 }}>
      <FeedToggle />
      <FlatList
        data={videos || []}
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
  const [isPaused, setIsPaused] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  React.useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.playAsync();
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, [isActive]);

  function handlePause() {
    setIsPaused((prev) => !prev);
    if (isPaused) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
  }

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
        onPress={() => {
          handlePause();
          // handleVideoPress();
        }}
        style={StyleSheet.absoluteFill}
      >
        <ExpoVideo
          ref={videoRef}
          style={styles.video}
          source={{ uri: video.videoUrl }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={false}
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
          <LikeButton video={video} />

          <VideoComments video={video} />
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
