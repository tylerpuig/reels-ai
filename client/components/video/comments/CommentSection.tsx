import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
  PanResponder,
  FlatList,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useVideoStore } from "../useVideoStore";
import Comment from "./Comment";

const { height } = Dimensions.get("window");
const COMMENT_SECTION_HEIGHT = height * 0.5;

export default function CommentSection() {
  const { isCommentsVisible, toggleIsCommentsVisible, setIsCommentsVisible } =
    useVideoStore();
  const slideAnim = useRef(new Animated.Value(COMMENT_SECTION_HEIGHT)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Handle initial visibility
  useEffect(() => {
    if (isCommentsVisible) {
      // Animate in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start();
    } else {
      // Animate out
      Animated.timing(slideAnim, {
        toValue: COMMENT_SECTION_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isCommentsVisible]);

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const SWIPE_THRESHOLD = 50;

  const closeAnim = Animated.timing(slideAnim, {
    toValue: COMMENT_SECTION_HEIGHT,
    duration: 300,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = Math.max(0, gestureState.dy);
        panY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD) {
          Animated.parallel([closeAnim, resetPositionAnim]).start(() => {
            setIsCommentsVisible(false);
          });
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  if (!isCommentsVisible) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.commentsSectionContainer,
        {
          transform: [
            {
              translateY: Animated.add(slideAnim, panY),
            },
          ],
        },
      ]}
    >
      <View style={styles.commentHeader}>
        <View style={styles.pullBar} />
        <TouchableOpacity onPress={toggleIsCommentsVisible}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Comments</Text>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Comment
              username={item.username}
              profilePhoto={item.profilePhoto}
              comment={item.comment}
              timestamp={item.timestamp}
            />
          )}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    paddingHorizontal: 15,
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
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },
});

const comments = [
  {
    id: "1",
    username: "dance_queen",
    profilePhoto: "https://randomuser.me/api/portraits/women/1.jpg",
    comment: "This video is fire! 🔥🔥🔥",
    timestamp: "2h ago",
  },
  // ... rest of the comments
];
