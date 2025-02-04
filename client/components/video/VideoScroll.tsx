import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { VideoFeed } from "./VideoItem";
import CommentSection from "./comments/CommentSection";
import { useVideoStore } from "./useVideoStore";

const { height } = Dimensions.get("window");
const COMMENT_SECTION_HEIGHT = height * 0.8;

export function VideoScroll() {
  const { isCommentsVisible, toggleIsCommentsVisible, setIsCommentsVisible } =
    useVideoStore();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // const resetPositionAnim = Animated.timing(panY, {
  //   toValue: 0,
  //   duration: 300,
  //   useNativeDriver: true,
  // });

  // const closeAnim = Animated.timing(slideAnim, {
  //   toValue: COMMENT_SECTION_HEIGHT,
  //   duration: 300,
  //   useNativeDriver: true,
  // });

  // const toggleComments = () => {
  //   const toValue = isCommentsVisible ? COMMENT_SECTION_HEIGHT : 0;

  //   Animated.spring(slideAnim, {
  //     toValue,
  //     useNativeDriver: true,
  //     friction: 8,
  //     tension: 65,
  //   }).start();

  //   setIsCommentsVisible(!isCommentsVisible);
  // };

  // Click away handler
  const handleClickAway = () => {
    if (isCommentsVisible) {
      toggleIsCommentsVisible();
    }
  };

  return (
    <View style={styles.container}>
      <VideoFeed />

      {/* Comments Button */}
      {/* <TouchableOpacity style={styles.commentsButton} onPress={toggleComments}>
        <Text style={styles.commentsButtonText}>Comments</Text>
      </TouchableOpacity> */}

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
  commentHeader: {
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  pullBar: {
    width: 40,
    height: 4,
    backgroundColor: "#666",
    borderRadius: 2,
    marginBottom: 10,
  },
  closeButton: {
    color: "#fff",
    fontSize: 14,
  },
});
