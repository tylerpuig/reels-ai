import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { trpc } from "../../trpc/client";
import { useSessionStore } from "@/hooks/useSession";
import type { LikedVideo, LikedListing } from "~/trpc/types";
import { useRouter } from "expo-router";
import { useVideoStore } from "../../components/video/useVideoStore";
import { usePathname } from "expo-router";

const VideoItem = ({
  item,
  onUnlike,
}: {
  item: LikedVideo;
  onUnlike: (id: number) => void;
}) => {
  const { setInitialVideoId } = useVideoStore();
  const router = useRouter();

  const handleVideoPress = () => {
    setInitialVideoId(item.id);
    router.push("/");
  };

  return (
    <TouchableOpacity
      onPress={handleVideoPress}
      className="p-4 border-b border-zinc-800"
    >
      <View className="relative">
        <Image
          source={{ uri: item.thumbnailUrl ?? "" }}
          className="w-full h-48 rounded-lg bg-zinc-900"
        />
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onUnlike(item.id);
          }}
          className="absolute top-2 right-2 p-2"
        >
          <Ionicons name="heart" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <Text className="text-white text-lg mt-2">{item.title}</Text>
    </TouchableOpacity>
  );
};

const ListingItem = ({
  item,
  onUnlike,
}: {
  item: LikedListing;
  onUnlike: (id: number) => void;
}) => {
  const router = useRouter();
  return (
    <View className="p-4 border-b border-zinc-800">
      <View className="relative">
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(modals)/listing/[id]",
              params: { id: item.id.toString() },
            });
          }}
        >
          <Image
            source={{ uri: item?.imageUrl ?? "" }}
            className="w-full h-48 rounded-lg bg-zinc-900"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onUnlike(item.id)}
          className="absolute top-2 right-2 p-2"
        >
          <Ionicons name="heart" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <Text className="text-white text-lg mt-2">{item.address}</Text>
      <View className="flex-row justify-between mt-1">
        <Text className="text-zinc-400">
          {"$" + item.price?.toLocaleString("en-US")}
        </Text>
        <Text className="text-zinc-400">
          {item.beds} bed • {item.baths} bath • {item.sqft} sqft
        </Text>
      </View>
    </View>
  );
};

export default function Likes() {
  const [activeTab, setActiveTab] = useState<"videos" | "listings">("videos");
  const { session } = useSessionStore();
  const pathname = usePathname();

  const { data: likedVideos, refetch: refetchVideos } =
    trpc.videos.getLikedVideos.useQuery(
      {
        userId: session?.user?.id ?? "",
      },
      {
        enabled: activeTab === "videos",
      }
    );

  const { data: likedListings, refetch: refetchListings } =
    trpc.listings.getLikedListings.useQuery(
      {
        userId: session?.user?.id ?? "",
      },
      {
        enabled: activeTab === "listings",
      }
    );

  const unlikeListing = trpc.listings.unLikeListing.useMutation({
    onSuccess: () => {
      refetchListings();
    },
  });
  const unlikeVideo = trpc.videos.unLikeVideo.useMutation({
    onSuccess: () => {
      refetchVideos();
    },
  });

  const handleUnlikeListing = (id: number) => {
    unlikeListing.mutate({
      listingId: id,
      userId: session?.user?.id ?? "",
    });
  };

  const handleUnlikeVideo = (id: number) => {
    unlikeVideo.mutate({
      videoId: id,
      userId: session?.user?.id ?? "",
    });
  };

  useEffect(() => {
    if (activeTab === "videos") {
      refetchVideos();
    } else {
      refetchListings();
    }
  }, [pathname]);

  return (
    <View className="flex-1 bg-[#121212] pt-16 mb-24">
      <View className="flex-row border-b border-zinc-800">
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${
            activeTab === "videos" ? "border-b-2 border-white" : ""
          }`}
          onPress={() => setActiveTab("videos")}
        >
          <Text
            className={`text-xl ${
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
            className={`text-xl ${
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
