import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
  Platform,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");
const MODAL_HEIGHT = height * 0.5;

type ShareButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
};

export default function ShareModal({
  visible,
  contentUrl,
  onClose,
}: {
  visible: boolean;
  contentUrl: string;
  onClose: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const panY = useRef(new Animated.Value(0)).current;

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
            toValue: MODAL_HEIGHT,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onClose();
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
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleShare = async (platform: string) => {
    switch (platform) {
      case "whatsapp":
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
          contentUrl
        )}`;
        await Linking.openURL(whatsappUrl);
        break;
      case "instagram":
        await Share.share({
          message: contentUrl,
        });
        break;
      case "tiktok":
        await Share.share({
          message: contentUrl,
        });
        break;
      case "sms":
        const smsUrl = Platform.select({
          ios: `sms:&body=${encodeURIComponent(contentUrl)}`,
          android: `sms:?body=${encodeURIComponent(contentUrl)}`,
        });
        if (!smsUrl) return;
        await Linking.openURL(smsUrl);
        break;
      case "copyLink":
        await Share.share({
          message: contentUrl,
        });
        break;
    }
    onClose();
  };

  const ShareButton = ({ icon, label, onPress, color }: ShareButtonProps) => (
    <TouchableOpacity style={styles.shareButton} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <Text style={styles.buttonLabel}>{label}</Text>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.modalContainer,
        {
          transform: [
            {
              translateY: Animated.add(slideAnim, panY),
            },
          ],
        },
      ]}
    >
      <View {...headerPanResponder.panHandlers} style={styles.headerContainer}>
        <View style={styles.pullBar} />
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.shareGrid}>
          <ShareButton
            icon="link"
            label="Copy link"
            color="#4B6BFB"
            onPress={() => handleShare("copyLink")}
          />
          <ShareButton
            icon="logo-whatsapp"
            label="WhatsApp"
            color="#25D366"
            onPress={() => handleShare("whatsapp")}
          />
          <ShareButton
            icon="stats-chart"
            label="Status"
            color="#25D366"
            onPress={() => handleShare("whatsapp")}
          />
          <ShareButton
            icon="logo-instagram"
            label="Instagram"
            color="#E4405F"
            onPress={() => handleShare("instagram")}
          />
          <ShareButton
            icon="logo-tiktok"
            label="TikTok"
            color="#000000"
            onPress={() => handleShare("tiktok")}
          />
          <ShareButton
            icon="chatbubbles"
            label="Messages"
            color="#007AFF"
            onPress={() => handleShare("sms")}
          />
        </View>

        <View style={styles.actionGrid}>
          <ShareButton
            icon="flag"
            label="Report"
            color="#666666"
            onPress={onClose}
          />
          <ShareButton
            icon="heart-dislike"
            label="Not interested"
            color="#666666"
            onPress={onClose}
          />
          <ShareButton
            icon="download"
            label="Save video"
            color="#666666"
            onPress={onClose}
          />
          <ShareButton
            icon="closed-captioning"
            label="Turn off captions"
            color="#666666"
            onPress={onClose}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: "#000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    zIndex: 999,
    elevation: 999,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  headerContainer: {
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
  shareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  shareButton: {
    width: "25%",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  buttonLabel: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
});
