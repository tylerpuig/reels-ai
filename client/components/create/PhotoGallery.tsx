import { useState } from "react";
import { trpc } from "../../trpc/client";
import {
  View,
  Text,
  Alert,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "~/components/ui/button";
import { Ionicons } from "@expo/vector-icons";

export type PhotoGalleryPhoto = {
  id: string;
  uri: string;
};

export function PhotoGallery({
  setImageLinks,
  photos,
  setPhotos,
}: {
  setImageLinks: React.Dispatch<React.SetStateAction<string[]>>;
  photos: PhotoGalleryPhoto[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoGalleryPhoto[]>>;
}) {
  const getPresignedS3Url = trpc.user.getPresignedS3Url.useMutation();

  const handleAddPhotos = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to enable photo library permissions to add photos."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 10,
      });
      if (!result.canceled) {
        const newPhotos = result.assets.map((asset) => ({
          id: Date.now().toString() + Math.random().toString(),
          uri: asset.uri,
        }));
        setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);

        if (!result.canceled) {
          const selectedImage = result.assets[0];
          const imageUri = selectedImage.uri;

          for (const photo of newPhotos) {
            try {
              const s3Data = await getPresignedS3Url.mutateAsync({
                fileName: `listing-img-${Date.now()}.jpg`,
              });

              if (!s3Data) return;

              let imageBlob: Blob;
              if (Platform.OS === "android") {
                const response = await fetch(imageUri);
                imageBlob = await response.blob();
              } else {
                // On iOS, we can create a blob from the file URI
                imageBlob = await new Promise((resolve, reject) => {
                  const xhr = new XMLHttpRequest();
                  xhr.onload = function () {
                    resolve(xhr.response);
                  };
                  xhr.onerror = function () {
                    reject(new Error("Failed to convert image to blob"));
                  };
                  xhr.responseType = "blob";
                  xhr.open("GET", imageUri, true);
                  xhr.send(null);
                });
              }

              const uploadResponse = await fetch(s3Data.uploadUrl, {
                method: "PUT",
                body: imageBlob,
                headers: {
                  "Content-Type": "image/jpeg",
                },
              });

              if (!uploadResponse.ok) {
                throw new Error("Failed to upload to S3");
              }

              setImageLinks((images) => [...images, s3Data.fileUrl]);
            } catch (error) {
              console.error("Upload error:", error);
            }
          }
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images. Please try again.");
      console.error("Image picker error:", error);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setPhotos((prevPhotos) =>
            prevPhotos.filter((photo) => photo.id !== photoId)
          );
        },
      },
    ]);
  };

  return (
    <View className="mt-4">
      {photos.length > 0 && (
        <View className="mb-4">
          <Text className="text-white mb-2">Photos ({photos.length})</Text>
          <View className="flex-row flex-wrap">
            {photos.map((photo) => (
              <View key={photo.id} className="mr-2 mb-2">
                <View className="relative">
                  <Image
                    source={{ uri: photo.uri }}
                    className="w-20 h-20 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(photo.id)}
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
        onPress={handleAddPhotos}
        // disabled={isUploading}
      >
        <Text className="">
          {photos.length === 0 ? "Add Photos" : "Add More Photos"}
        </Text>
      </Button>
    </View>
  );
}
