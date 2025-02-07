import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Conversation {
  id: string;
  userName: string;
  userImage: string;
  propertyAddress: string;
  lastMessage: string;
  lastMessageTime: string;
}

export function ConversationList({
  conversations,
  handleConversationPress,
}: {
  conversations: Conversation[];
  handleConversationPress: (conversation: Conversation) => void;
}) {
  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      onPress={() => {
        console.log("Conversation pressed:", item);
        handleConversationPress(item);
      }}
      style={styles.conversationItem}
    >
      {/* User Image */}
      <Image source={{ uri: item.userImage }} style={styles.userImage} />

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.userName}
          </Text>
          <Text style={styles.timeText}>{item.lastMessageTime}</Text>
        </View>

        <Text style={styles.propertyAddress} numberOfLines={1}>
          {item.propertyAddress}
        </Text>

        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
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
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

// Example usage
export function ExampleConversationList() {
  const sampleConversations: Conversation[] = [
    {
      id: "1",
      userName: "Sarah Johnson",
      userImage: "https://i.pravatar.cc/100?u=1",
      propertyAddress: "123 Park Avenue, New York, NY 10002",
      lastMessage: "Yes, I would love to schedule a viewing for tomorrow.",
      lastMessageTime: "2:30 PM",
    },
    {
      id: "2",
      userName: "Michael Chen",
      userImage: "https://i.pravatar.cc/100?u=2",
      propertyAddress: "456 Ocean Drive, Miami Beach, FL 33139",
      lastMessage: "What are the HOA fees for this property?",
      lastMessageTime: "11:45 AM",
    },
    {
      id: "3",
      userName: "Emily Rodriguez",
      userImage: "https://i.pravatar.cc/100?u=3",
      propertyAddress: "789 Sunset Boulevard, Los Angeles, CA 90028",
      lastMessage: "Is the price negotiable?",
      lastMessageTime: "Yesterday",
    },
  ];

  const router = useRouter();

  const handleConversationPress = (conversation: Conversation) => {
    console.log("Conversation pressed:", conversation);
    router.push({
      pathname: "/(modals)/chat/[id]",
      params: { id: conversation.id },
    });
  };

  return (
    <ConversationList
      conversations={sampleConversations}
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
