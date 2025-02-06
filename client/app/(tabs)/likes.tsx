import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { trpc } from "../../trpc/client";
import { useSessionStore } from "@/hooks/useSession";
import type { LikedVideo, LikedListing } from "~/trpc/types";
// type VideoLike = {
//   id: number;
//   title: string;
//   thumbnailUrl: string;
//   videoUrl: string;
// };

const VideoItem = ({
  item,
  onUnlike,
}: {
  item: LikedVideo;
  onUnlike: (id: number) => void;
}) => (
  <View className="p-4 border-b border-zinc-800">
    <View className="relative">
      <Image
        source={{ uri: item.thumbnailUrl ?? "" }}
        className="w-full h-48 rounded-lg bg-zinc-900"
      />
      <TouchableOpacity
        onPress={() => onUnlike(item.id)}
        className="absolute top-2 right-2 p-2"
      >
        <Ionicons name="heart" size={24} color="red" />
      </TouchableOpacity>
    </View>
    <Text className="text-white text-lg mt-2">{item.title}</Text>
  </View>
);

const ListingItem = ({
  item,
  onUnlike,
}: {
  item: LikedListing;
  onUnlike: (id: number) => void;
}) => (
  <View className="p-4 border-b border-zinc-800">
    <View className="relative">
      <Image
        source={{ uri: item?.imageUrl ?? "" }}
        className="w-full h-48 rounded-lg bg-zinc-900"
      />
      <TouchableOpacity
        onPress={() => onUnlike(item.id)}
        className="absolute top-2 right-2 p-2"
      >
        <Ionicons name="heart" size={24} color="red" />
      </TouchableOpacity>
    </View>
    <Text className="text-white text-lg mt-2">{item.address}</Text>
    <View className="flex-row justify-between mt-1">
      <Text className="text-zinc-400">{item.price}</Text>
      <Text className="text-zinc-400">
        {item.beds} bed • {item.baths} bath • {item.sqft} sqft
      </Text>
    </View>
  </View>
);

export default function Likes() {
  const [activeTab, setActiveTab] = useState<"videos" | "listings">("videos");
  const { session } = useSessionStore();

  const {
    data: likedVideos,
    isLoading: isLoadingVideos,
    refetch: refetchVideos,
  } = trpc.videos.getLikedVideos.useQuery(
    {
      userId: session?.user?.id ?? "",
    },
    {
      enabled: activeTab === "videos",
      refetchOnMount: true,
    }
  );

  const { data: likedListings, isLoading: isLoadingListings } =
    trpc.listings.getLikedListings.useQuery(
      {
        userId: session?.user?.id ?? "",
      },
      {
        enabled: activeTab === "listings",
        refetchOnMount: true,
      }
    );

  console.log("activeTab", activeTab);
  console.log(likedListings);

  const unlikeVideo = trpc.videos.unLikeVideo.useMutation({
    onSuccess: () => {
      refetchVideos();
    },
  });

  const handleUnlikeVideo = (id: number) => {
    // Implement unlike video logic
    unlikeVideo.mutate({
      videoId: id,
      userId: session?.user?.id ?? "",
    });
  };

  const handleUnlikeListing = (id: number) => {
    // Implement unlike listing logic
    console.log("Unlike listing:", id);
  };

  return (
    <View className="flex-1 bg-[#121212] pt-16">
      <View className="flex-row border-b border-zinc-800">
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${
            activeTab === "videos" ? "border-b-2 border-white" : ""
          }`}
          onPress={() => setActiveTab("videos")}
        >
          <Text
            className={`text-base ${
              activeTab === "videos" ? "text-white" : "text-zinc-500"
            }`}
          >
            Videos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${
            activeTab === "listings" ? "border-b-2 border-white" : ""
          }`}
          onPress={() => setActiveTab("listings")}
        >
          <Text
            className={`text-base ${
              activeTab === "listings" ? "text-white" : "text-zinc-500"
            }`}
          >
            Homes
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "videos" ? (
        <FlatList
          data={likedVideos ?? []} // Add your video data here
          renderItem={({ item }) => (
            <VideoItem item={item} onUnlike={handleUnlikeVideo} />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <FlatList
          data={likedListings ?? []} // Add your listing data here
          renderItem={({ item }) => (
            <ListingItem item={item} onUnlike={handleUnlikeListing} />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}
