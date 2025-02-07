import { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "~/components/ui/button";
import { Ionicons } from "@expo/vector-icons";

type MediaItem = {
  id: string;
  uri: string;
  type: "image" | "video";
  duration?: number; // For videos
};

type MediaGalleryProps = {
  type: "image" | "video" | "both";
  onMediaSelected?: (media: MediaItem[]) => void;
  maxItems?: number;
};

function MediaGallery({
  type = "both",
  onMediaSelected,
  maxItems = 10,
}: MediaGalleryProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddMedia = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to enable media library permissions."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          type === "image"
            ? ImagePicker.MediaTypeOptions.Images
            : type === "video"
            ? ImagePicker.MediaTypeOptions.Videos
            : ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: maxItems - mediaItems.length,
      });

      if (!result.canceled) {
        const newMedia = result.assets.map((asset) => ({
          id: Date.now().toString() + Math.random().toString(),
          uri: asset.uri,
          type: asset.type === "video" ? "video" : "image",
          duration: asset.duration, // Will be undefined for images
        }));

        const updatedMedia = [...mediaItems, ...newMedia];
        setMediaItems(updatedMedia as MediaItem[]);
        onMediaSelected?.(updatedMedia as MediaItem[]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick media. Please try again.");
      console.error("Media picker error:", error);
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const updatedMedia = mediaItems.filter((item) => item.id !== mediaId);
          setMediaItems(updatedMedia);
          onMediaSelected?.(updatedMedia);
        },
      },
    ]);
  };

  return (
    <View className="mt-4">
      {mediaItems.length > 0 && (
        <View className="mb-4">
          <Text className="text-white mb-2">
            {type === "both" ? "Media" : type === "image" ? "Photos" : "Videos"}
            ({mediaItems.length})
          </Text>
          <View className="flex-row flex-wrap">
            {mediaItems.map((item) => (
              <View key={item.id} className="mr-2 mb-2">
                <View className="relative">
                  <Image
                    source={{ uri: item.uri }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                  />
                  {item.type === "video" && (
                    <View className="absolute bottom-1 right-1 bg-black/50 rounded-full p-1">
                      <Ionicons name="play" size={12} color="white" />
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveMedia(item.id)}
                    className="absolute -top-1 -right-1 bg-black/50 rounded-full w-5 h-5 items-center justify-center"
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <Button
        variant="outline"
        className="w-full"
        onPress={handleAddMedia}
        disabled={isUploading || mediaItems.length >= maxItems}
      >
        <Text className="ml-2">
          {mediaItems.length === 0
            ? `Add ${
                type === "both"
                  ? "Media"
                  : type === "image"
                  ? "Photos"
                  : "Videos"
              }`
            : `Add More ${
                type === "both"
                  ? "Media"
                  : type === "image"
                  ? "Photos"
                  : "Videos"
              }`}
        </Text>
      </Button>
    </View>
  );
}
