import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
  PanResponder,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useVideoStore } from "../useVideoStore";
import Comment from "./Comment";
import { trpc } from "../../../trpc/client";
import { useSessionStore } from "@/hooks/useSession";
import { useVideoContext } from "@/hooks/useVideoContext";

const { height } = Dimensions.get("window");
const COMMENT_SECTION_HEIGHT = height * 0.6;

export default function CommentSection() {
  const {
    isCommentsVisible,
    toggleIsCommentsVisible,
    setIsCommentsVisible,
    activeVideoId,
  } = useVideoStore();
  const { session } = useSessionStore();
  const { setCurrentVideo } = useVideoContext();
  const [newComment, setNewComment] = useState("");
  const slideAnim = useRef(new Animated.Value(COMMENT_SECTION_HEIGHT)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const [keyboardPadding, setKeyboardPadding] = useState(70);

  const { data: comments, refetch: refetchComments } =
    trpc.videos.getvideoComments.useQuery({
      videoId: activeVideoId,
    });

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardWillShow", () => {
      setKeyboardPadding(280);
    });
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardPadding(70);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const addCommentMutation = trpc.videos.createComment.useMutation({
    onSuccess: () => {
      refetchComments();
      setNewComment("");
      // refetchVideos();
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    addCommentMutation.mutate({
      videoId: activeVideoId,
      content: newComment.trim(),
      userId: session?.user?.id ?? "",
    });

    setCurrentVideo((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        commentCount: prev.commentCount + 1,
      };
    });
  };

  const headerPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = Math.max(0, gestureState.dy);
        panY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
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

  const styles = StyleSheet.create({
    keyboardView: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: COMMENT_SECTION_HEIGHT,
    },
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
    inputWrapper: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#000",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
      paddingVertical: 10,
      paddingBottom: keyboardPadding,
      backgroundColor: "#000",
      borderTopWidth: 1,
      borderTopColor: "#333",
    },
    input: {
      flex: 1,
      backgroundColor: "#1a1a1a",
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      color: "#fff",
      fontSize: 14,
      maxHeight: 100,
      marginRight: 10,
    },
    sendButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: "#007AFF",
      borderRadius: 20,
    },
    sendButtonDisabled: {
      backgroundColor: "#1a1a1a",
    },
    sendButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    sendButtonTextDisabled: {
      color: "#666",
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <Animated.View
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
            data={comments ?? []}
            keyExtractor={(item) => item.comments.id.toString()}
            renderItem={({ item }) => (
              <Comment
                username={item.users?.name ?? ""}
                profilePhoto={item.users?.avatarUrl ?? ""}
                comment={item.comments.content}
                timestamp={item.comments.createdAt.toLocaleString()}
              />
            )}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.commentsList}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.inputWrapper}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                placeholderTextColor="#666"
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSubmitComment}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !newComment.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                <Text
                  style={[
                    styles.sendButtonText,
                    !newComment.trim() && styles.sendButtonTextDisabled,
                  ]}
                >
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
