import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { trpc } from "../../trpc/client";
import { useSessionStore } from "@/hooks/useSession";
import { type ConversationData } from "../../trpc/types";

export function ConversationList({
  conversations,
  handleConversationPress,
}: {
  conversations: ConversationData[];
  handleConversationPress: (conversation: ConversationData) => void;
}) {
  const renderItem = ({ item }: { item: ConversationData }) => (
    <TouchableOpacity
      onPress={() => {
        console.log("Conversation pressed:", item);
        handleConversationPress(item);
      }}
      style={styles.conversationItem}
    >
      {/* User Image */}
      <Image
        source={{ uri: item.recipientAvatarUrl ?? "" }}
        style={styles.userImage}
      />

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.recipientName}
          </Text>
          <Text style={styles.timeText}>
            {item.lastMessageAt.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.propertyAddress} numberOfLines={1}>
          {item.listingAddress}
        </Text>

        <Text style={styles.lastMessage} numberOfLines={1}>
          {/* {item.} */}
        </Text>
      </View>

      {/* Right Arrow */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#666"
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Messages</Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
}

export function ViewConversationList() {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useSessionStore();
  const { data: conversations, refetch: refetchConversations } =
    trpc.chat.getUserConversations.useQuery({
      userId: session?.user?.id ?? "",
    });

  useEffect(() => {
    refetchConversations();
  }, [pathname]);

  const handleConversationPress = (conversation: ConversationData) => {
    router.push({
      pathname: "/(modals)/chat/[id]",
      params: {
        id: conversation.id,
        agentId: conversation.recipientId,
        agentPhoto: conversation.recipientAvatarUrl,
        agentName: conversation.recipientName,
      },
    });
  };

  return (
    <ConversationList
      conversations={conversations ?? []}
      handleConversationPress={handleConversationPress}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingTop: 64, // Matches the PT-16 from your original
  },
  header: {
    paddingHorizontal: 32, // Matches the PX-8 from your original
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a", // Zinc-800 equivalent
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
    color: "#a1a1aa", // Zinc-400 equivalent
    fontSize: 14,
    marginLeft: 8,
  },
  propertyAddress: {
    color: "#a1a1aa", // Zinc-400 equivalent
    marginTop: 2,
  },
  lastMessage: {
    color: "#71717a", // Zinc-500 equivalent
    fontSize: 14,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
});
