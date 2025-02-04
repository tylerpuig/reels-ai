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
const COMMENT_SECTION_HEIGHT = height * 0.6;

export default function CommentSection() {
  const { isCommentsVisible, toggleIsCommentsVisible, setIsCommentsVisible } =
    useVideoStore();
  const slideAnim = useRef(new Animated.Value(COMMENT_SECTION_HEIGHT)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const headerPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only handle vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = Math.max(0, gestureState.dy);
        panY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          // SWIPE_THRESHOLD
          Animated.timing(slideAnim, {
            toValue: COMMENT_SECTION_HEIGHT,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setIsCommentsVisible(false);
            panY.setValue(0);
          });
        } else {
          Animated.timing(panY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isCommentsVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: COMMENT_SECTION_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isCommentsVisible]);

  if (!isCommentsVisible) return null;

  return (
    <Animated.View
      className="pb-10"
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
      <View {...headerPanResponder.panHandlers} style={styles.commentHeader}>
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
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.commentsList}
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
  commentsList: {
    paddingBottom: 20,
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
  {
    id: "2",
    username: "tech_ninja",
    profilePhoto: "https://randomuser.me/api/portraits/men/2.jpg",
    comment: "The editing on this is next level! Tutorial please? 🎬✨",
    timestamp: "1h ago",
  },
  {
    id: "3",
    username: "wanderlust_soul",
    profilePhoto: "https://randomuser.me/api/portraits/women/3.jpg",
    comment: "This location looks amazing! Where was this filmed? 🌎",
    timestamp: "45m ago",
  },
  {
    id: "4",
    username: "beat_master",
    profilePhoto: "https://randomuser.me/api/portraits/men/4.jpg",
    comment: "That transition at 0:15 was smooth af 🎵",
    timestamp: "30m ago",
  },
  {
    id: "5",
    username: "creative_mind",
    profilePhoto: "https://randomuser.me/api/portraits/women/5.jpg",
    comment: "Your content keeps getting better and better! 📈",
    timestamp: "20m ago",
  },
  {
    id: "6",
    username: "fitness_freak",
    profilePhoto: "https://randomuser.me/api/portraits/men/6.jpg",
    comment: "This inspired my workout today! 💪 Thanks for sharing",
    timestamp: "15m ago",
  },
  {
    id: "7",
    username: "art_lover",
    profilePhoto: "https://randomuser.me/api/portraits/women/7.jpg",
    comment: "The colors in this video are absolutely stunning 🎨",
    timestamp: "10m ago",
  },
  {
    id: "8",
    username: "music_junkie",
    profilePhoto: "https://randomuser.me/api/portraits/men/8.jpg",
    comment: "Song name? Need this on my playlist ASAP 🎧",
    timestamp: "5m ago",
  },
  {
    id: "9",
    username: "positive_vibes",
    profilePhoto: "https://randomuser.me/api/portraits/women/9.jpg",
    comment: "This made my day! Keep spreading joy 🌟",
    timestamp: "3m ago",
  },
  {
    id: "10",
    username: "comedy_king",
    profilePhoto: "https://randomuser.me/api/portraits/men/10.jpg",
    comment: "The way you did that part at the end 😂 Genius!",
    timestamp: "1m ago",
  },
];
