import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import { Mic, MicOff, PhoneOff } from "lucide-react-native";
import { Audio } from "expo-av";
import { trpc } from "../../trpc/client";
import { ELEVEN_LABS_API_KEY } from "../../constants/app";
import { useSessionStore } from "../../hooks/useSession";

type PhoneCallDialogProps = {
  visible: boolean;
  onClose: () => void;
  agentName: string;
  agentPhoto: string;
  conversationId: number;
};

export function PhoneCallDialog({
  visible,
  onClose,
  agentName,
  agentPhoto,
  conversationId,
}: PhoneCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [waveAnimations, setWaveAnimations] = useState(
    [...Array(10)].map(() => new Animated.Value(Math.random()))
  );
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const { session } = useSessionStore();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const getPresignedUrl = trpc.user.getPresignedS3Url.useMutation();
  const respondToUserVoiceMessage =
    trpc.chat.respondToUserVoiceMessage.useMutation();

  const playTTS = async (text: string) => {
    try {
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=mp3_44100_128",
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVEN_LABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
          }),
        }
      );

      // The response will be an MP3 blob
      const blob = await response.blob();

      // Convert blob to base64
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result;
          resolve(base64String);
        };
      });

      setIsPlayingSound(true);

      // Play using Expo Audio (built into React Native)
      const { sound } = await Audio.Sound.createAsync(
        { uri: base64Data as string },
        { shouldPlay: true }
      );

      // Optional: Clean up
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
          setIsPlayingSound(false);
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  async function startRecording() {
    try {
      // Request permissions
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("Recording URI:", uri);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    if (!uri) return;

    const fileName = "recordings/" + new Date().toISOString() + ".m4a";
    // Create blob from URI
    const response = await fetch(uri);
    const blob = await response.blob();

    const s3Data = await getPresignedUrl.mutateAsync({
      fileName: fileName,
    });

    if (!s3Data) return;

    const { uploadUrl, fileUrl } = s3Data;

    // Upload to S3
    await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": "audio/m4a",
      },
    });

    const aiReponse = await respondToUserVoiceMessage.mutateAsync({
      conversationId: conversationId,
      fileUrl: fileUrl,
      userId: session?.user?.id ?? "",
    });

    console.log(aiReponse);

    await playTTS(aiReponse.response);

    setRecording(null);
  }

  // Timer for call duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [visible]);

  useEffect(() => {
    waveAnimations.forEach((anim) => anim.setValue(0.3));

    const animate = () => {
      Animated.stagger(
        10,
        waveAnimations.map((anim) =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * (1 - 0.6) + 0.6,
              duration: Math.random() * (600 - 400) + 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * (0.4 - 0.2) + 0.2,
              duration: Math.random() * (600 - 400) + 300,
              useNativeDriver: true,
            }),
          ])
        )
      ).start(() => {
        animate();
      });
    };

    animate();

    return () => {
      waveAnimations.forEach((anim) => {
        anim.stopAnimation();
        anim.setValue(0.3);
      });
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Agent Info */}
          <View style={styles.agentInfoContainer}>
            <Image source={{ uri: agentPhoto }} style={styles.agentPhoto} />
            <Text style={styles.agentName}>{agentName}</Text>
            <Text style={styles.agentTitle}>Real Estate Agent</Text>
            <Text style={styles.timer}>{formatTime(callDuration)}</Text>
          </View>

          {/* Audio Waves */}
          {!isMuted && isPlayingSound && (
            <View style={styles.waveContainer}>
              {waveAnimations.map((anim, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.wave,
                    {
                      transform: [
                        {
                          scaleY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Call Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              onPress={() => {
                // setIsMuted((prev) => !prev);

                if (!isRecording) {
                  startRecording();
                } else {
                  stopRecording();
                }
              }}
              style={[
                styles.controlButton,
                { backgroundColor: isMuted ? "#dc2626" : "#3f3f46" },
              ]}
            >
              {!isRecording ? (
                <MicOff color="white" size={24} />
              ) : (
                <Mic color="white" size={24} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.controlButton, styles.hangupButton]}
            >
              <PhoneOff color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  agentInfoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  agentPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  agentName: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  agentTitle: {
    color: "#a1a1aa",
    fontSize: 16,
    marginBottom: 8,
  },
  timer: {
    color: "white",
    fontFamily: "monospace",
    fontSize: 16,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    marginBottom: 24,
    gap: 4,
  },
  wave: {
    width: 4,
    height: 24,
    backgroundColor: "white",
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 32,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3f3f46",
    justifyContent: "center",
    alignItems: "center",
  },
  hangupButton: {
    backgroundColor: "#dc2626",
  },
});
