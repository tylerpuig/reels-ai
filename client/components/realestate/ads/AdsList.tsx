import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { trpc } from "../../../trpc/client";
import { useSessionStore } from "@/hooks/useSession";
import { Swipeable } from "react-native-gesture-handler";
import { Trash } from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { type AdItem } from "../../../trpc/types";

const RightActions = (
  progress: Animated.AnimatedInterpolation<number>,
  dragX: Animated.AnimatedInterpolation<number>,
  onDelete: () => void
) => {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <TouchableOpacity onPress={onDelete}>
      <View style={styles.deleteAction}>
        <Animated.Text
          style={[styles.deleteActionText, { transform: [{ scale }] }]}
        >
          <Trash size={24} color="white" />
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
};

export function AdsList({
  ads,
  handleAdPress,
  onDeleteAdPress,
}: {
  ads: AdItem[];
  handleAdPress: (conversation: AdItem) => void;
  onDeleteAdPress: (conversationId: number) => void;
}) {
  const rowRefs = useRef<{ [key: string]: Swipeable }>({});

  const renderItem = ({ item }: { item: AdItem }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) rowRefs.current[item.id] = ref;
      }}
      renderRightActions={(progress, dragX) =>
        RightActions(progress, dragX, () => {
          onDeleteAdPress(item.id);
          rowRefs.current[item.id]?.close();
        })
      }
      rightThreshold={40}
    >
      <TouchableOpacity
        onPress={() => {
          handleAdPress(item);
        }}
        style={styles.conversationItem}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.title}
            </Text>
          </View>

          <Text style={styles.propertyAddress} numberOfLines={1}>
            Created on {item.createdAt.toISOString().slice(0, 10)}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#666"
          style={styles.chevron}
        />
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={ads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
}

export function ViewAdList() {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useSessionStore();
  const { data: ads, refetch: refetchAdsList } = trpc.ads.getUserAds.useQuery({
    userId: session?.user?.id ?? "",
  });

  const deletAd = trpc.ads.deleteAd.useMutation({
    onSuccess: () => {
      refetchAdsList();
    },
  });

  useEffect(() => {
    refetchAdsList();
  }, [pathname]);

  const handleAdPress = (ad: AdItem) => {
    router.push({
      pathname: "/(modals)/adMetrics/[id]",
      params: {
        id: ad.id,
      },
    });
  };

  const handleDeleteAd = async (adId: number) => {
    try {
      await deletAd.mutateAsync({ adId });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AdsList
        ads={ads ?? []}
        handleAdPress={handleAdPress}
        onDeleteAdPress={handleDeleteAd}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: "#dc2626", // Red color
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  deleteActionText: {
    color: "white",
    fontWeight: "600",
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingTop: 0,
  },
  header: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    backgroundColor: "#0a0a0a",
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userName: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  timeText: {
    color: "#a1a1aa",
    fontSize: 14,
    marginLeft: 8,
  },
  propertyAddress: {
    color: "#a1a1aa",
    marginTop: 2,
  },
  lastMessage: {
    color: "#71717a",
    fontSize: 14,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
});
