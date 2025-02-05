import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";

interface ImageComparisonSliderProps {
  originalImage: string;
  generatedImage: string | null;
  height?: number;
  sliderEnabled: boolean;
}

export default function ImageComparisonSlider({
  originalImage,
  generatedImage,
  height = 300,
}: ImageComparisonSliderProps) {
  const screenWidth = Dimensions.get("window").width - 40; // Account for padding
  const [sliderEnabled, setSliderEnbaled] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(
    new Animated.Value(screenWidth)
  );

  useEffect(() => {
    if (!generatedImage) return;

    const newPosition = new Animated.Value(screenWidth / 2);
    setSliderPosition(newPosition);
  }, [generatedImage]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      //   if (!sliderEnabled) return;
      const newPosition = Math.max(
        0,
        Math.min(screenWidth, gestureState.moveX - 20)
      ); // 20 for container padding
      sliderPosition.setValue(newPosition);
    },
  });

  return (
    <View style={[styles.container, { height }]}>
      {/* Generated Image (Background) */}
      {generatedImage && (
        <Image
          source={{ uri: generatedImage }}
          style={[styles.image, { height }]}
          resizeMode="cover"
        />
      )}

      {/* Original Image (Foreground with dynamic width) */}
      <Animated.View
        style={[
          styles.foregroundContainer,
          {
            width: sliderPosition,
            height,
          },
        ]}
      >
        <Image
          source={{ uri: originalImage }}
          style={[styles.image, { height }]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Slider Handle */}
      <Animated.View
        style={[
          styles.sliderHandle,
          {
            transform: [{ translateX: Animated.subtract(sliderPosition, 15) }], // Center the 30px wide handle
            height: height,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.sliderLine} />
        <View style={styles.sliderCircle} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
  },
  image: {
    position: "absolute",
    width: "100%",
  },
  foregroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  sliderHandle: {
    position: "absolute",
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderLine: {
    width: 3,
    height: "100%",
    backgroundColor: "white",
  },
  sliderCircle: {
    position: "absolute",
    top: "50%",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    transform: [{ translateY: -15 }],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
