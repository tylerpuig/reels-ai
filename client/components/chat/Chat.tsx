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

interface Message {
  id: string;
  text: string;
  sender: "user1" | "user2";
}

interface ChatProps {
  agentName?: string;
  agentImage?: string;
  onPhonePress?: () => void;
}

export default function Chat({
  agentName = "John Smith",
  agentImage = "https://i.pravatar.cc/100",
  onPhonePress,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const bottomMargin = useRef(new Animated.Value(16)).current;

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

  const sendMessage = (sender: "user1" | "user2", text: string) => {
    if (text.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSend = () => {
    if (inputText.trim() === "") return;

    // Send user message
    sendMessage("user1", inputText);
    setInputText("");

    // Simulate auto-reply after a delay
    setTimeout(() => {
      sendMessage("user2", `Reply to: ${inputText}`);
    }, 1000);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`max-w-[80%] px-4 py-2 rounded-2xl mb-2 ${
        item.sender === "user1" ? "self-end bg-white" : "self-start bg-zinc-900"
      }`}
    >
      <Text
        className={`text-base ${
          item.sender === "user1" ? "text-black" : "text-white"
        }`}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#0a0a0a] pt-16"
    >
      <View className="px-8 py-4 border-b border-zinc-800 flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
          <Image
            source={{ uri: agentImage }}
            className="w-12 h-12 rounded-full"
          />
          <View>
            <Text className="text-white text-lg font-semibold">
              {agentName}
            </Text>
            <Text className="text-zinc-400">Real Estate Agent</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onPhonePress}
          className="w-10 h-10 bg-zinc-900 rounded-full items-center justify-center"
        >
          <Ionicons name="call-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
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
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            className="bg-white px-4 rounded-xl items-center justify-center"
            onPress={handleSend}
          >
            <Text className="text-base font-semibold text-black">Send</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
