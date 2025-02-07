import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSessionStore } from "@/hooks/useSession";
import { useRef } from "react";
import { Trash } from "lucide-react-native";

interface CommentProps {
  username: string;
  profilePhoto: string;
  comment: string;
  timestamp: string;
  userId: string;
  onDelete?: () => void;
}

const RightActions = (
  progress: Animated.AnimatedInterpolation<number>,
  dragX: Animated.AnimatedInterpolation<number>,
  onDelete: () => void
) => {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <TouchableOpacity onPress={onDelete}>
      <View style={styles.deleteAction}>
        <Animated.Text
          style={[styles.deleteActionText, { transform: [{ scale }] }]}
        >
          <Trash size={24} color="white" />
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
};

export default function Comment({
  username,
  profilePhoto,
  comment,
  timestamp,
  userId,
  onDelete,
}: CommentProps) {
  const { session } = useSessionStore();
  const isOwnComment = session?.user?.id === userId;
  const swipeableRef = useRef<Swipeable>(null);

  const CommentContent = (
    <View style={styles.commentContainer}>
      <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
      <View style={styles.commentContent}>
        <Text className="text-white" style={styles.username}>
          {username}
        </Text>
        <Text className="text-white" style={styles.commentText}>
          {comment}
        </Text>
        <Text className="text-white" style={styles.timestamp}>
          {timestamp}
        </Text>
      </View>
    </View>
  );

  if (!isOwnComment || !onDelete) {
    return CommentContent;
  }

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete?.();
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={(progress, dragX) =>
        RightActions(progress, dragX, handleDelete)
      }
      rightThreshold={40}
      overshootRight={false}
      friction={2}
      enableTrackpadTwoFingerGesture
      containerStyle={styles.swipeableContainer}
      childrenContainerStyle={styles.swipeableContent}
    >
      {CommentContent}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
    backgroundColor: "#000",
  },
  swipeableContent: {
    backgroundColor: "#000",
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#000",
    padding: 12,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  commentText: {
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
  deleteAction: {
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  deleteActionText: {
    color: "white",
    fontWeight: "600",
    padding: 20,
  },
});
