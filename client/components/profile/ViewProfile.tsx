import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProfileView({ userId }: { userId: string }) {
  const router = useRouter();

  const renderVideoItem = ({ item, index }) => (
    <TouchableOpacity
      className={`flex-1 aspect-square m-0.5 ${
        index % 3 === 1 ? "border-l border-r border-zinc-800" : ""
      }`}
    >
      <Image source={{ uri: item.thumbnail }} className="w-full h-full" />
      <View className="absolute bottom-0 left-0 right-0 p-1 bg-black/30">
        <Text className="text-white text-xs flex-row items-center">
          <Ionicons name="play" size={12} color="white" /> {item.views}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#0a0a0a] pt-6">
      {/* Header */}
      <View className="flex-row items-center pt-12 px-5 pb-3 border-b border-zinc-800">
        <TouchableOpacity className="p-1 z-10" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4 text-white">Profile</Text>
      </View>

      {/* Profile Section */}
      <View className="p-5">
        <View className="flex-row items-center mb-5">
          <Image
            source={{ uri: "https://placekitten.com/200/200" }}
            className="w-20 h-20 rounded-full mr-4"
          />
          <View className="flex-1">
            <Text className="text-xl font-bold text-white mb-1">
              @reelsuser
            </Text>
            <Text className="text-sm text-zinc-400">
              ✨ Creating awesome content
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between items-center py-4 px-5 bg-zinc-900 rounded-xl">
          <View className="items-center flex-1">
            <Text className="text-lg font-bold text-white mb-1">1.2M</Text>
            <Text className="text-xs text-zinc-400">Followers</Text>
          </View>
          <View className="w-px h-8 bg-zinc-800" />
          <View className="items-center flex-1">
            <Text className="text-lg font-bold text-white mb-1">10.5M</Text>
            <Text className="text-xs text-zinc-400">Likes</Text>
          </View>
          <View className="w-px h-8 bg-zinc-800" />
          <View className="items-center flex-1">
            <Text className="text-lg font-bold text-white mb-1">152M</Text>
            <Text className="text-xs text-zinc-400">Views</Text>
          </View>
        </View>
      </View>

      {/* Videos Section */}
      <View className="flex-1">
        <Text className="text-base font-semibold px-5 py-3 text-white">
          Videos
        </Text>
        <FlatList
          data={[
            {
              id: "1",
              thumbnail: "https://placekitten.com/300/400",
              views: "1.2M",
            },
            {
              id: "2",
              thumbnail: "https://placekitten.com/300/401",
              views: "890K",
            },
            {
              id: "3",
              thumbnail: "https://placekitten.com/300/401",
              views: "890K",
            },
          ]}
          renderItem={({ item, index }) => renderVideoItem({ item, index })}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          className="px-0.5"
        />
      </View>
    </View>
  );
}
