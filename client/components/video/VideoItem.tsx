import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  ViewToken,
  TouchableOpacity,
  Animated,
  PanResponder,
  Pressable,
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
import { useVideoContext } from "@/hooks/useVideoContext";

export function VideoFeed() {
  const { videoPaginationSkip } = useVideoStore();
  const { setCurrentVideo } = useVideoContext();

  const { session } = useSessionStore();
  const [currentViewableItemIndex, setCurrentViewableItemIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentViewableItemIndex(viewableItems[0].index ?? 0);
    }
  };
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
  }, [currentViewableItemIndex]);

  return (
    <View style={styles.container}>
      <FlatList
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
  const { setIsShareModalVisible } = useVideoStore();
  const { currentVideo, setCurrentVideo } = useVideoContext();

  useEffect(() => {
    if (!video.current) return;

    if (shouldPlay) {
      video.current.playAsync();
    } else {
      video.current.pauseAsync();
      video.current.setPositionAsync(0);
    }
  }, [shouldPlay]);

  // useEffect(() => {
  //   setCurrentVideo(item);
  // }, [item]);

  return (
    <Pressable
      onPress={() =>
        status.isPlaying
          ? video.current?.pauseAsync()
          : video.current?.playAsync()
      }
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
        />

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
    fontSize: 12,
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
});
