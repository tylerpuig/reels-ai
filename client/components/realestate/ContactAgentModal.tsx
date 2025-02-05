import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  agentName: string;
  propertyAddress: string;
}

export default function ContactModal({
  visible,
  onClose,
  agentName,
  propertyAddress,
}: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [visible]);

  const handleSubmit = () => {
    // Handle form submission here
    console.log(formData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            className="bg-[#0a0a0a] rounded-t-3xl mt-auto"
            style={{
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            }}
          >
            <View className="p-4 border-b border-zinc-800">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-semibold text-white">
                  Contact Agent
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="text-zinc-400 mt-1">
                Sending message to {agentName}
              </Text>
              <Text className="text-zinc-400">regarding {propertyAddress}</Text>
            </View>

            <ScrollView className="p-4">
              <View className="space-y-4">
                <View>
                  <Text className="text-zinc-400 mb-2">Your Name</Text>
                  <TextInput
                    className="bg-zinc-900 p-4 rounded-xl text-white"
                    placeholder="Enter your name"
                    placeholderTextColor="#666"
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData({ ...formData, name: text })
                    }
                  />
                </View>

                <View>
                  <Text className="text-zinc-400 mb-2">Email Address</Text>
                  <TextInput
                    className="bg-zinc-900 p-4 rounded-xl text-white"
                    placeholder="Enter your email"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                  />
                </View>

                <View>
                  <Text className="text-zinc-400 mb-2">Phone Number</Text>
                  <TextInput
                    className="bg-zinc-900 p-4 rounded-xl text-white"
                    placeholder="Enter your phone number"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phone: text })
                    }
                  />
                </View>

                <View>
                  <Text className="text-zinc-400 mb-2">Message</Text>
                  <TextInput
                    className="bg-zinc-900 p-4 rounded-xl text-white h-32"
                    placeholder="Enter your message"
                    placeholderTextColor="#666"
                    multiline
                    textAlignVertical="top"
                    value={formData.message}
                    onChangeText={(text) =>
                      setFormData({ ...formData, message: text })
                    }
                  />
                </View>
              </View>
            </ScrollView>

            <View className="p-4 border-t border-zinc-800">
              <TouchableOpacity
                className="bg-white py-4 rounded-xl items-center"
                onPress={handleSubmit}
              >
                <Text className="text-base font-semibold text-black">
                  Send Message
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
