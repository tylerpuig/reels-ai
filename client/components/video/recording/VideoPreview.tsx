import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Animated,
  PanResponder,
} from "react-native";
import * as ExpoVideo from "expo-av";
import { X, ArrowRight, Check } from "lucide-react-native";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.4;

type ViewPreviewProps = {
  videoUri: string;
  onCancel: () => void;
  onConfirm: () => void;
};
export default function VideoPreview({
  videoUri,
  onCancel,
  onConfirm,
}: ViewPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const video = useRef<ExpoVideo.Video>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const swipeOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      if (gesture.dx > 0) {
        // Only allow right swipe
        pan.x.setValue(gesture.dx);
        // Calculate opacity based on swipe progress
        const progress = Math.min(gesture.dx / SWIPE_THRESHOLD, 1);
        swipeOpacity.setValue(progress);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        // Swipe completed, trigger confirm
        Animated.spring(pan, {
          toValue: { x: width, y: 0 },
          useNativeDriver: false,
        }).start(onConfirm);
      } else {
        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        Animated.timing(swipeOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const togglePlayback = async () => {
    if (video.current) {
      if (isPlaying) {
        await video.current.pauseAsync();
      } else {
        await video.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const containerStyle = {
    transform: pan.getTranslateTransform(),
  };

  return (
    <View style={styles.container} className="pb-24">
      <Animated.View
        style={[styles.videoContainer, containerStyle]}
        {...panResponder.panHandlers}
      >
        <ExpoVideo.Video
          ref={video}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ExpoVideo.ResizeMode.COVER}
          isLooping={true}
          shouldPlay={true}
          // onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        {/* Swipe indicator */}
        <Animated.View
          style={[
            styles.swipeIndicator,
            {
              opacity: swipeOpacity,
            },
          ]}
        >
          <Check color="white" size={32} />
          <Text style={styles.swipeText}>Release to confirm</Text>
        </Animated.View>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <X color="white" size={24} />
        </TouchableOpacity>

        <View style={styles.swipeInstruction}>
          <Text style={styles.swipeInstructionText}>
            Swipe right to confirm
          </Text>
          <ArrowRight color="white" size={20} />
        </View>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={togglePlayback}
        >
          <Text style={styles.playPauseText}>{isPlaying ? "⏸️" : "▶️"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  cancelButton: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    position: "absolute",
    right: 16,
    bottom: 32,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseText: {
    fontSize: 24,
  },
  swipeInstruction: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  swipeInstructionText: {
    color: "white",
    fontSize: 16,
  },
  swipeIndicator: {
    position: "absolute",
    right: 32,
    top: "50%",
    transform: [{ translateY: -50 }],
    alignItems: "center",
  },
  swipeText: {
    color: "white",
    marginTop: 8,
    fontSize: 14,
  },
});
