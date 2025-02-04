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

interface Video {
  id: string;
  url: number;
  username: string;
  description: string;
}

const { width, height } = Dimensions.get("window");
console.log(width, height);
const TAB_BAR_HEIGHT = 49;

const videoSources: Video[] = [
  {
    id: "1",
    url: require("../../videos/ny_video.mp4"),
    username: "New York Penthouse",
    description: "New York Penthouse",
  },
  {
    id: "2",
    url: require("../../videos/most_expensive_il.mp4"),
    username: "Sintel",
    description: "Most expensive house in Illinois",
  },
  {
    id: "3",
    url: require("../../videos/penhoust_palace_chi.mp4"),
    username: "Penhoust Palace",
    description: "Huge Penhouse Palace in Chicago",
  },
  {
    id: "4",
    url: require("../../videos/penhoust_palace_chi.mp4"),
    username: "Penhoust Palace",
    description: "Huge Penhouse Palace in Chicago",
  },
  {
    id: "5",
    url: require("../../videos/penhoust_palace_chi.mp4"),
    username: "Penhoust Palace",
    description: "Huge Penhouse Palace in Chicago",
  },
];

export function VideoFeed() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const containerHeight = height - TAB_BAR_HEIGHT - insets.top;

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
    <View style={{ flex: 1 }}>
      <FeedToggle />
      <FlatList
        data={videoSources}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
  video: Video;
  isActive: boolean;
}

function VideoItem({ video }: VideoItemProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const videoRef = React.useRef<ExpoVideo>(null);
  const [status, setStatus] = React.useState({});
  const { setIsCommentsVisible } = useVideoStore();
  const [isPaused, setIsPaused] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  React.useEffect(() => {
    if (videoRef.current) {
      if (!isPaused) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isPaused]);

  // React.useEffect(() => {
  //   setIsPaused(false);
  // }, [video]);

  const handleVideoPress = async () => {
    setIsPaused(!isPaused);
    setShowPlayButton(true);
    // Hide the play/pause button after 2 seconds
    setShowPlayButton(false);
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
          source={video.url}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={true}
          // shouldPlay={true}
          onPlaybackStatusUpdate={(status) => setStatus(status)}
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
          <Text style={styles.username}>{video.username}</Text>
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
            <Text style={styles.buttonText}>103k</Text>
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
            <Text style={styles.buttonText}>826</Text>
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
