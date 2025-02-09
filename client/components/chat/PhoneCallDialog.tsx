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
import { Camera, Mic, MicOff, PhoneOff } from "lucide-react-native";

type PhoneCallDialogProps = {
  visible: boolean;
  onClose: () => void;
  agentName: string;
  agentPhoto: string;
};

export function PhoneCallDialog({
  visible,
  onClose,
  agentName,
  agentPhoto,
}: PhoneCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [wavePhase, setWavePhase] = useState(0);
  const waveAnimations = [...Array(10)].map(() => new Animated.Value(0));

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

  // Animate audio waves
  useEffect(() => {
    const animate = () => {
      const animations = waveAnimations.map((anim, index) => {
        // Create a random initial delay for each bar to create a more natural wave effect
        const randomDelay = Math.random() * 1000;

        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
              delay: randomDelay,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
      });

      // Start all animations
      animations.forEach((animation) => animation.start());
    };

    if (visible && !isMuted) {
      animate();
    }

    return () => {
      waveAnimations.forEach((anim) => anim.stopAnimation());
    };
  }, [visible, isMuted]);

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
          {!isMuted && (
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
              onPress={() => setIsMuted(!isMuted)}
              style={[
                styles.controlButton,
                { backgroundColor: isMuted ? "#dc2626" : "#3f3f46" },
              ]}
            >
              {isMuted ? (
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

            <TouchableOpacity style={styles.controlButton}>
              <Camera color="white" size={24} />
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
