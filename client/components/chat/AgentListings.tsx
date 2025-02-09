import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  FlatList,
  Image,
} from "react-native";
import { trpc } from "../../trpc/client";
import { type AgentListing } from "../../trpc/types";
import { useRouter } from "expo-router";

const { height } = Dimensions.get("window");
const MODAL_HEIGHT = height * 0.8;

type AgentLisingModalProps = {
  visible: boolean;
  onClose: () => void;
  agentId: string;
};

export default function AgentListingModal({
  visible,
  onClose,
  agentId,
}: AgentLisingModalProps) {
  const { data: listingsByAgent } = trpc.listings.getListingsByAgent.useQuery(
    { agentId: agentId },
    {
      enabled: visible,
    }
  );
  const router = useRouter();

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

  const renderListingItem = ({ item }: { item: AgentListing }) => (
    <TouchableOpacity
      style={styles.listingItem}
      onPress={() => {
        console.log("open listing modal");
        router.push({
          pathname: "/(modals)/listing/[id]",
          params: { id: item.id.toString() },
        });
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.listingImage}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.addressText}>{item.address}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.priceText}>
          ${item.price?.toLocaleString("en-US")}
        </Text>
        <Text style={styles.detailsText}>
          {item.beds} bed • {item.baths} bath • {item.sqft} sqft
        </Text>
      </View>
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

      <FlatList
        data={listingsByAgent ?? []}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
  listContainer: {
    paddingBottom: 20,
  },
  listingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  imageContainer: {
    position: "relative",
  },
  listingImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
  },
  addressText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  priceText: {
    color: "#999",
    fontSize: 14,
  },
  detailsText: {
    color: "#999",
    fontSize: 14,
  },
});
