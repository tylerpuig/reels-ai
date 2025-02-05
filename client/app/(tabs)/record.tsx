import React, { useState, useRef, useCallback } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Camera } from "lucide-react-native";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  //   Svg,
  //   Circle,
} from "react-native";
import { Svg, Circle } from "react-native-svg";
import VideoPreview from "../../components/video/recording/VideoPreview";

const { width, height } = Dimensions.get("window");

export default function SnapchatCamera() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleCancel = () => {
    setRecordedVideo(null);
  };

  const handleConfirm = async () => {
    // Here you would typically upload the video
    console.log("Uploading video:", recordedVideo);
    try {
      // Add your upload logic here
      // After successful upload:
      setRecordedVideo(null);
    } catch (error) {
      console.error("Failed to upload video:", error);
    }
  };

  const startRecording = useCallback(async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    setProgress(0);

    try {
      const videoRecordPromise = cameraRef.current.recordAsync({
        maxDuration: 10,
      });

      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            stopRecording();
            return 0;
          }
          return prev + 2;
        });
      }, 100);

      const video = await videoRecordPromise;
      console.log("Video recorded:", video?.uri ?? "");
      setRecordedVideo(video?.uri ?? null);
    } catch (error) {
      console.error("Failed to record video:", error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      if (progressInterval?.current) clearInterval(progressInterval?.current);
      setProgress(0);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  }, [isRecording]);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need camera permission to continue
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (recordedVideo) {
    return (
      <VideoPreview
        videoUri={recordedVideo}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    );
  }

  const circleCircumference = 2 * Math.PI * 30;
  const strokeDasharray = [
    (progress / 100) * circleCircumference,
    circleCircumference,
  ];

  return (
    <View className="pb-24" style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
      >
        <View style={styles.controlsContainer}>
          <View style={styles.buttonContainer}>
            <View style={styles.recordButtonContainer}>
              <Svg
                style={styles.progressCircle}
                width={70}
                height={70}
                viewBox="0 0 70 70"
              >
                <Circle
                  cx={35}
                  cy={35}
                  r={30}
                  fill="none"
                  stroke="white"
                  strokeWidth={3}
                  strokeDasharray={strokeDasharray}
                  rotation={-90}
                  originX={35}
                  originY={35}
                />
              </Svg>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                ]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
              />
            </View>

            <TouchableOpacity
              onPress={toggleCameraFacing}
              style={styles.flipButton}
            >
              <Camera width={24} height={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 48,
  },
  recordButtonContainer: {
    position: "relative",
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  progressCircle: {
    position: "absolute",
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "white",
    backgroundColor: "transparent",
  },
  recordButtonActive: {
    backgroundColor: "red",
    transform: [{ scale: 0.9 }],
  },
  flipButton: {
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    borderRadius: 30,
    padding: 12,
  },
  message: {
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  permissionButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    textAlign: "center",
  },
});
