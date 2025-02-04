import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { VideoFeed } from "./VideoItem";
import CommentSection from "./comments/CommentSection";
import { useVideoStore } from "./useVideoStore";

const { height } = Dimensions.get("window");
const COMMENT_SECTION_HEIGHT = height * 0.8;

export function VideoScroll() {
  const { isCommentsVisible, toggleIsCommentsVisible } = useVideoStore();

  // Click away handler
  const handleClickAway = () => {
    if (isCommentsVisible) {
      toggleIsCommentsVisible();
    }
  };

  return (
    <View style={styles.container}>
      <VideoFeed />

      {/* Overlay for click away */}
      {isCommentsVisible && (
        <TouchableWithoutFeedback onPress={handleClickAway}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Animated Comments Section */}
      <CommentSection />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 998,
  },
  commentsButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 997,
  },
  commentsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  commentsSectionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: COMMENT_SECTION_HEIGHT,
    backgroundColor: "#000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    zIndex: 999,
    elevation: 999,
  },
});
