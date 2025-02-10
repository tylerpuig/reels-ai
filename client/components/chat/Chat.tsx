import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { type ConversationMessage } from "../../trpc/types";
import { trpc } from "../../trpc/client";
import { useSessionStore } from "@/hooks/useSession";
import { makePhoneCall } from "../../components/realestate/Listing";
import { EventConfirmation, type EventMetadata } from "./EventConfirmation";
import AgentListingModal from "./AgentListings";
import { PhoneCallDialog } from "./PhoneCallDialog";

type ChatProps = {
  conversationId: number;
  agentId: string;
  agentPhoto: string;
  agentName: string;
};

export default function Chat({
  conversationId,
  agentId,
  agentPhoto,
  agentName,
}: ChatProps) {
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const bottomMargin = useRef(new Animated.Value(16)).current;
  const router = useRouter();
  const { session } = useSessionStore();
  const [showAgentListingModal, setShowAgentListingModal] = useState(false);
  const [showAgentPhoneCallModal, setShowAgentPhoneCallModal] = useState(false);

  const { data: messages, refetch: refetchMessages } =
    trpc.chat.getConversationMessages.useQuery(
      {
        conversationId: conversationId,
      },
      {
        refetchInterval: 2000,
      }
    );

  const sendConversationMessage = trpc.chat.sendConversationMessage.useMutation(
    {
      onSuccess: () => {
        refetchMessages();
        setInputText("");
      },
    }
  );

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(bottomMargin, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(bottomMargin, {
          toValue: 16,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    sendConversationMessage.mutate({
      conversationId,
      content: inputText,
      senderId: session?.user?.id ?? "",
    });
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    setShowAgentPhoneCallModal(true);
  }, []);

  const renderMessage = ({
    item,
    userId,
  }: {
    item: ConversationMessage;
    userId: string;
  }) => {
    return (
      <View className="">
        <View
          className={`max-w-[80%] px-4 py-2 rounded-2xl mb-2 ${
            item.senderId === userId
              ? "self-end bg-white"
              : "self-start bg-zinc-700"
          }`}
        >
          <Text
            className={`text-base ${
              item.senderId === userId ? "text-black" : "text-white"
            }`}
          >
            {item.content}
          </Text>
        </View>

        <EventConfirmation
          metadata={item.metadata as EventMetadata}
          isUserMessage={item.senderId === userId}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#0a0a0a] pt-12"
    >
      {/* Header */}
      <View className="flex-row items-center pt-6 px-5 pb-3 border-b border-zinc-800">
        <TouchableOpacity
          className="p-1 z-10"
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4 text-white">Messages</Text>
      </View>

      <AgentListingModal
        agentId={agentId}
        visible={showAgentListingModal}
        onClose={() => setShowAgentListingModal(false)}
      />

      <View className="px-8 py-4 border-b border-zinc-800 flex-row items-center justify-between">
        <View className="flex-row items-center justify-between flex-1">
          {/* Agent Info Section */}
          <TouchableOpacity
            onPress={() => {
              console.log("show agent listing modal");
              setShowAgentListingModal(true);
            }}
            className="flex-row items-center flex-1"
          >
            <Image
              source={{ uri: agentPhoto }}
              className="w-12 h-12 rounded-full"
            />

            <View className="ml-2">
              <Text className="text-white text-lg font-semibold">
                {agentName}
              </Text>
              <Text className="text-zinc-400">Real Estate Agent</Text>
            </View>
          </TouchableOpacity>

          {/* Phone Call Button */}
          <TouchableOpacity
            onPress={() => {
              makePhoneCall("+12345678901");
            }}
            className="w-10 h-10 bg-zinc-900 rounded-full items-center justify-center ml-4"
          >
            <Ionicons name="call-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <PhoneCallDialog
        visible={showAgentPhoneCallModal}
        onClose={() => setShowAgentPhoneCallModal(false)}
        agentName={agentName}
        agentPhoto={agentPhoto}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) =>
          renderMessage({ item, userId: session?.user?.id ?? "" })
        }
        keyExtractor={(item) => item.id.toString()}
        className="px-4 py-5"
      />

      <Animated.View
        style={{ marginBottom: bottomMargin }}
        className="p-4 border-t border-zinc-800 px-8"
      >
        <View className="gap-4 flex-row">
          <TextInput
            className="flex-1 bg-zinc-900 px-4 py-3 rounded-xl text-white"
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            className="bg-white px-4 rounded-xl items-center justify-center"
            onPress={sendMessage}
          >
            <Text className="text-base font-semibold text-black">Send</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
