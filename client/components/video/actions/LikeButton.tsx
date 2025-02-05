import { View, Text, Animated, Easing } from "react-native";
import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react-native";
import { useVideoStore } from "../useVideoStore";
import { trpc } from "../../../trpc/client";
import { useSessionStore } from "@/hooks/useSession";
import { useRef } from "react";
import { type VideoData } from "../../../trpc/types";

const styles = {
  buttonText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
};

export default function LikeButton({
  video,
  videoState,
  setVideoState,
}: {
  video: VideoData;
  videoState: VideoData | null;
  setVideoState: React.Dispatch<React.SetStateAction<VideoData | null>>;
}) {
  const { videoPaginationSkip } = useVideoStore();
  const { session } = useSessionStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { refetch: refetchVideos } = trpc.videos.getVideos.useQuery(
    {
      skip: videoPaginationSkip,
      userId: session?.user?.id ?? "",
    },
    {
      enabled: false,
    }
  );

  const modifyVideoLike = trpc.videos.modifyVideoLike.useMutation({
    onSuccess: () => {
      refetchVideos();
    },
  });

  const handlePress = () => {
    if (!video || !session?.user?.id) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();
    modifyVideoLike.mutate({
      videoId: video.id,
      userId: session?.user?.id,
      action: videoState?.hasLiked ? "unlike" : "like",
    });

    setVideoState((prev) => {
      const hasLikedVideo = prev?.hasLiked;
      if (prev) {
        return {
          ...prev,
          likeCount: hasLikedVideo ? prev.likeCount - 1 : prev.likeCount + 1,
          hasLiked: !prev.hasLiked,
        };
      }
      return null;
    });
  };

  return (
    <View style={{ alignItems: "center" }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Button
          onPress={handlePress}
          variant="default"
          size="icon"
          className="bg-transparent"
        >
          <Heart
            size={28}
            color={videoState?.hasLiked ? "red" : "white"}
            strokeWidth={2}
            fill={videoState?.hasLiked ? "red" : "transparent"}
          />
        </Button>
      </Animated.View>
      <Text style={styles.buttonText}>{videoState?.likeCount ?? 0}</Text>
    </View>
  );
}
