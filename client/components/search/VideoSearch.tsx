import { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { trpc } from "../../trpc/client";
import { type SimilarVideoResult } from "../../trpc/types";
import { useVideoStore } from "../video/useVideoStore";

export default function SearchView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { setInitialVideoId } = useVideoStore();
  const { data: videos, refetch } = trpc.videos.getSimilarVideos.useQuery(
    { text: searchQuery },
    {
      enabled: false,
    }
  );

  const renderVideoItem = ({
    item,
    index,
  }: {
    item: SimilarVideoResult;
    index: number;
  }) => {
    const handleVideoPress = () => {
      setInitialVideoId(item.id);
      router.push("/");
    };
    const randVideoViews = Math.floor(Math.random() * 800_000).toLocaleString();
    return (
      <TouchableOpacity
        onPress={() => {
          // Handle video selection
          handleVideoPress();
        }}
        className={`flex-1 aspect-[3/4] m-0.5 ${
          index % 3 === 1 ? "border-l border-r border-zinc-800" : ""
        }`}
      >
        <Image
          source={{ uri: item.thumbnailUrl ?? "" }}
          className="w-full h-full"
        />
        <View className="absolute bottom-0 left-0 right-0 p-1 bg-black/30">
          <Text className="text-white text-xs flex-row items-center">
            <Ionicons name="play" size={12} color="white" /> {randVideoViews}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleSearch = () => {
    refetch();
  };

  return (
    <View className="flex-1 bg-[#0a0a0a] pt-16">
      {/* Search Bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-zinc-800">
        <View className="flex-1 flex-row items-center bg-zinc-900 rounded-xl px-4 py-2 mr-2">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search videos..."
            placeholderTextColor="#666"
            className="flex-1 ml-2 text-white"
          />
        </View>
        <TouchableOpacity
          onPress={handleSearch}
          className="bg-zinc-800 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">Search</Text>
        </TouchableOpacity>
      </View>

      {/* Videos Grid */}
      <FlatList
        data={videos ?? []}
        renderItem={({ item, index }) => renderVideoItem({ item, index })}
        keyExtractor={(item) => (item.similarity ?? "").toString()}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        className="px-0.5"
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-zinc-400">No videos found</Text>
          </View>
        )}
      />
    </View>
  );
}
