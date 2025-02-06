import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Pause, Share2, House } from "lucide-react-native";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useVideoStore } from "./useVideoStore";
import { useRouter } from "expo-router";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { type VideoData } from "~/trpc/types";
import { trpc } from "@/trpc/client";
import LikeButton from "./actions/LikeButton";
import VideoComments from "./actions/VideoComments";
import { usePathname } from "expo-router";
import { useSessionStore } from "@/hooks/useSession";
import { useVideoContext } from "@/hooks/useVideoContext";

export function VideoFeed() {
  const { videoPaginationSkip, initialVideoId, setInitialVideoId } =
    useVideoStore();
  const { setCurrentVideo } = useVideoContext();
  const flatListRef = useRef<FlatList>(null);
  const { session } = useSessionStore();
  const [currentViewableItemIndex, setCurrentViewableItemIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentViewableItemIndex(viewableItems[0].index ?? 0);
    }
  };

  const pathname = usePathname();
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const { data: videos, refetch: refetchVideos } =
    trpc.videos.getVideos.useQuery(
      {
        skip: videoPaginationSkip,
        userId: session?.user?.id ?? "",
      },
      {
        refetchOnMount: true,
        staleTime: 0,
        cacheTime: 0,
      }
    );

  useEffect(() => {
    if (videos && videos[currentViewableItemIndex]) {
      setCurrentVideo(videos[currentViewableItemIndex]);
    }
  }, [currentViewableItemIndex, videos]);

  useEffect(() => {
    refetchVideos();
  }, [currentViewableItemIndex, pathname]);

  useEffect(() => {
    if (initialVideoId && videos) {
      const index = videos.findIndex((video) => video.id === initialVideoId);
      if (index !== -1) {
        // Add a small delay to ensure FlatList is ready
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: false,
            viewPosition: 0, // ensures the item is aligned to the top
          });
          setInitialVideoId(null); // Reset after scrolling
        }, 50);
      }
    }
  }, [initialVideoId, videos]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={({ item, index }) => (
          <Item item={item} shouldPlay={index === currentViewableItemIndex} />
        )}
        keyExtractor={(item) => item.videoUrl}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        contentContainerStyle={styles.flatListContent}
        decelerationRate="fast"
        snapToInterval={Dimensions.get("window").height}
        snapToAlignment="start"
      />
    </View>
  );
}

const Item = ({
  item,
  shouldPlay,
}: {
  shouldPlay: boolean;
  item: VideoData;
}) => {
  const router = useRouter();
  const video = React.useRef<ExpoVideo | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  const pathname = usePathname();
  const isVideoFeedPath = pathname === "/";

  const { setIsShareModalVisible } = useVideoStore();
  const { currentVideo, setCurrentVideo } = useVideoContext();

  useEffect(() => {
    if (!video.current) return;

    if (shouldPlay) {
      video.current.playAsync();
      setIsPaused(false);
    } else {
      video.current.pauseAsync();
      video.current.setPositionAsync(0);
      setIsPaused(true);
    }
  }, [shouldPlay]);

  useEffect(() => {
    if (!isVideoFeedPath) {
      video?.current?.pauseAsync();
      setIsPaused(true);
    }
  }, [isVideoFeedPath]);

  return (
    <Pressable
      onPress={() => {
        const isPlaying = status?.isPlaying;
        if (isPlaying) {
          video.current?.pauseAsync();
          setIsPaused(true);
        } else {
          video.current?.playAsync();
          setIsPaused(false);
        }
      }}
      style={styles.itemContainer}
    >
      <View style={styles.videoContainer}>
        <ExpoVideo
          ref={video}
          source={{ uri: item.videoUrl }}
          style={styles.video}
          isLooping
          resizeMode={ResizeMode.COVER}
          useNativeControls={false}
          onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          onLoad={() => {
            if (shouldPlay) {
              video.current?.playAsync();
              // setIsPaused(false);
            }
          }}
        />
        {!status?.isPlaying && isPaused && shouldPlay && (
          <View style={styles.pauseIconContainer}>
            <Pause size={40} color="white" />
          </View>
        )}

        <TouchableOpacity
          style={styles.detailsContainer}
          onPress={() => {
            if (video.current) {
              video.current.pauseAsync();
            }
            router.push({
              pathname: "/(modals)/listing/[id]",
              params: { id: item.listingId },
            });
          }}
        >
          <View style={styles.detailsOverlay}>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/(modals)/viewprofile/[id]",
                params: { id: item.userId },
              });
            }}
            style={{ alignItems: "center" }}
          >
            <Avatar alt="Zach Nugent's Avatar">
              <AvatarImage source={{ uri: item.userImage ?? "" }} />
              <AvatarFallback>
                <Text>{"ZN"}</Text>
              </AvatarFallback>
            </Avatar>
            <Text style={styles.buttonText}>{item.userName ?? "Profile"}</Text>
          </TouchableOpacity>
          <LikeButton
            setVideoState={setCurrentVideo}
            video={item}
            videoState={currentVideo}
          />

          <VideoComments video={item} />

          <Button
            onPress={() => {
              setIsShareModalVisible(true);
            }}
            variant="default"
            size="icon"
            className="bg-transparent"
          >
            <Share2 className="h-7 w-7 text-white" color="white" />
          </Button>
          <Button
            onPress={() => {
              if (video.current) {
                video.current.pauseAsync();
              }
              router.push({
                pathname: "/(modals)/listing/[id]",
                params: { id: "1" },
              });
            }}
            variant="default"
            size="icon"
            className="bg-transparent"
          >
            <House className="h-7 w-7 text-white" color="white" />
          </Button>
        </View>
      </View>
    </Pressable>
  );
};

// function formatUserName(name: string) {
//   if (name.length > 5) {
//     return `${name.slice(0, 5)}...`;
//   }
//   return name;
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  flatListContent: {
    flexGrow: 0,
  },
  itemContainer: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginTop: 4,
  },
  buttonContainer: {
    position: "absolute",
    right: 16,
    bottom: 220,
    alignItems: "center",
    gap: 16,
    zIndex: 10,
  },
  detailsContainer: {
    position: "absolute",
    bottom: 160,
    left: 16,
    right: 100,
    zIndex: 10,
  },
  detailsOverlay: {
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    borderRadius: 8,
  },
  titleText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  descriptionText: {
    color: "white",
    fontSize: 14,
  },
  pauseIconContainer: {
    position: "absolute",
    top: Dimensions.get("window").height / 2 - 70, // 35 = (circle size / 2)
    left: Dimensions.get("window").width / 2 - 35,
    width: 70, // Circle size
    height: 70, // Circle size
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 35, // Half of width/height to make it circular
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30,
  },
});
