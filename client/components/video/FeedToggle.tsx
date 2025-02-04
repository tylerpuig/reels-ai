import { View, Text, TouchableOpacity } from "react-native";
export function FeedToggle() {
  return (
    <View className="absolute top-14 left-0 right-0 z-50 flex-row justify-center">
      <View className="flex-row bg-black/50 rounded-full p-1.5">
        <TouchableOpacity className="px-6 py-1.5 bg-white rounded-full">
          <Text className="text-black font-semibold">For You</Text>
        </TouchableOpacity>
        <TouchableOpacity className="px-6 py-1.5">
          <Text className="text-white font-semibold">Following</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
