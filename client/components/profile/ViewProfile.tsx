import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { trpc } from "../../trpc/client";
import { type PublicProfileData } from "../../trpc/types";
import { useVideoStore } from "../video/useVideoStore";

export default function ProfileView({ userId }: { userId: string }) {
  const router = useRouter();
  const { setInitialVideoId } = useVideoStore();
  const { data: profileData } = trpc.user.getPublicProfileData.useQuery({
    profileId: userId,
  });

  const renderVideoItem = ({
    item,
    index,
  }: {
    item: PublicProfileData["videos"][number];
    index: number;
  }) => {
    const randVideoViews = Math.floor(Math.random() * 800_000).toLocaleString();
    return (
      <TouchableOpacity
        onPress={() => {
          setInitialVideoId(item.id);

          router.push({
            pathname: "/",
          });
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

  const randomFollowerCount = Math.floor(
    Math.random() * 5_000
  ).toLocaleString();
  const randomLikesCount = Math.floor(Math.random() * 10_000).toLocaleString();
  const randomViewsCount = Math.floor(Math.random() * 100_000).toLocaleString();

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
            source={{ uri: profileData?.profile?.avatarUrl ?? "" }}
            className="w-20 h-20 rounded-full mr-4"
          />
          <View className="flex-1">
            <Text className="text-xl font-bold text-white mb-1">
              {profileData?.profile?.name ?? ""}
            </Text>
            <Text className="text-sm text-zinc-400">
              ✨ Creating awesome content
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between items-center py-4 px-5 bg-zinc-900 rounded-xl">
          <View className="items-center flex-1">
            <Text className="text-lg font-bold text-white mb-1">
              {randomFollowerCount}
            </Text>
            <Text className="text-xs text-zinc-400">Followers</Text>
          </View>
          <View className="w-px h-8 bg-zinc-800" />
          <View className="items-center flex-1">
            <Text className="text-lg font-bold text-white mb-1">
              {randomLikesCount}
            </Text>
            <Text className="text-xs text-zinc-400">Likes</Text>
          </View>
          <View className="w-px h-8 bg-zinc-800" />
          <View className="items-center flex-1">
            <Text className="text-lg font-bold text-white mb-1">
              {randomViewsCount}
            </Text>
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
          data={profileData?.videos ?? []}
          renderItem={({ item, index }) => renderVideoItem({ item, index })}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          className="px-0.5"
        />
      </View>
    </View>
  );
}
