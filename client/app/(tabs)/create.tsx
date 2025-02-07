import React, { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Text } from "~/components/ui/text";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "../../trpc/client";
import type {
  ListingFormData,
  VideoSubmitData,
} from "../../../packages/api-types";
import { useSessionStore } from "../../hooks/useSession";

export default function ListingForm() {
  const { session } = useSessionStore();
  const [videoData, setVideoData] = useState<VideoSubmitData>({
    title: "",
    description: "",
    videoUrl: "",
  });
  const [imageLinks, setImageLinks] = useState<string[]>([]);
  const [formData, setFormData] = useState<ListingFormData>({
    description: "",
    price: 0,
    address: "",
    city: "",
    state: "",
    zip: "",
    beds: 0,
    baths: 0,
    sqft: 0,
    agentPhone: "",
    agentAgency: "",
  });

  const createListing = trpc.listings.createNewListing.useMutation();

  const handleInputChange = (field: keyof ListingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "price" ||
        field === "beds" ||
        field === "baths" ||
        field === "sqft"
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const renderInput = (
    label: string,
    field: keyof ListingFormData,
    placeholder: string,
    keyboardType: "default" | "numeric" = "default"
  ) => (
    <View className="mt-4">
      <Text className="text-white mb-2">{label}</Text>
      <TextInput
        className="bg-zinc-900 p-4 rounded-xl text-white"
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={formData[field]?.toString() || ""}
        onChangeText={(text) => handleInputChange(field, text)}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a] px-4 mt-20 mb-24">
      <Accordion
        type="multiple"
        collapsible
        defaultValue={["home-info", "listing-details"]}
        className="w-full"
      >
        {/* Home Info Section */}
        <AccordionItem value="home-info">
          <AccordionTrigger>
            <Text className="text-xl font-semibold text-white">
              Video Details
            </Text>
          </AccordionTrigger>
          <AccordionContent>
            <View className="mt-4">
              <Text className="text-white mb-2">Title</Text>
              <TextInput
                className="bg-zinc-900 p-4 rounded-xl text-white"
                placeholder={"Enter a video title"}
                placeholderTextColor="#666"
                value={videoData.title}
                onChangeText={(text) =>
                  setVideoData({ ...videoData, title: text })
                }
                // keyboardType={keyboardType}
              />
            </View>
            <View className="mt-4">
              <Text className="text-white mb-2">Description</Text>
              <TextInput
                className="bg-zinc-900 p-4 rounded-xl text-white min-h-[100px] mb-4"
                placeholder="Enter video description"
                placeholderTextColor="#666"
                multiline
                textAlignVertical="top"
                value={videoData.description}
                onChangeText={(text) =>
                  setVideoData({ ...videoData, description: text })
                }
              />
            </View>
            <ImportVideoButton setVideoData={setVideoData} />
          </AccordionContent>
        </AccordionItem>

        {/* Listing Details Section */}
        <AccordionItem value="listing-details">
          <AccordionTrigger>
            <Text className="text-lg font-semibold text-white">
              Listing Details
            </Text>
          </AccordionTrigger>
          <AccordionContent>
            {renderInput("Price", "price", "Enter price", "numeric")}
            {renderInput("Address", "address", "Enter street address")}
            {renderInput("City", "city", "Enter city")}

            <View className="flex-row justify-between mt-4">
              <View className="flex-1 mr-2">
                <Text className="text-white mb-2">State</Text>

                <TextInput
                  className="bg-zinc-900 p-4 rounded-xl text-white"
                  placeholder="ST"
                  placeholderTextColor="#666"
                  maxLength={2}
                  value={formData.state}
                  onChangeText={(text) =>
                    handleInputChange("state", text.toUpperCase())
                  }
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-white mb-2">ZIP</Text>
                <TextInput
                  className="bg-zinc-900 p-4 rounded-xl text-white"
                  placeholder="Enter ZIP"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={10}
                  value={formData.zip}
                  onChangeText={(text) => handleInputChange("zip", text)}
                />
              </View>
            </View>

            <View className="flex-row justify-between mt-4">
              <View className="flex-1 mr-2">
                <Text className="text-white mb-2">Beds</Text>
                <TextInput
                  className="bg-zinc-900 p-4 rounded-xl text-white"
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={formData.beds?.toString()}
                  onChangeText={(text) => handleInputChange("beds", text)}
                />
              </View>
              <View className="flex-1 mx-2">
                <Text className="text-white mb-2">Baths</Text>
                <TextInput
                  className="bg-zinc-900 p-4 rounded-xl text-white"
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={formData.baths?.toString()}
                  onChangeText={(text) => handleInputChange("baths", text)}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-white mb-2">Sq Ft</Text>
                <TextInput
                  className="bg-zinc-900 p-4 rounded-xl text-white"
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={formData.sqft?.toString()}
                  onChangeText={(text) => handleInputChange("sqft", text)}
                />
              </View>
            </View>

            {renderInput("Agent Phone", "agentPhone", "(555) 555-5555")}
            {renderInput("Agency", "agentAgency", "Enter agency name")}

            <PhotoGallery setImageLinks={setImageLinks} />
            {/* <MediaGallery
              onMediaSelected={(media) => {
                console.log(media);
              }}
              type="video"
            /> */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <View className="py-6">
        <Button
          variant="outline"
          className="mt-4"
          onPress={() => {
            createListing.mutate({
              userId: session?.user?.id ?? "",
              listing: formData,
              video: videoData,
              listingImages: imageLinks,
            });
          }}
        >
          <Text className="">
            {createListing.isLoading ? "Creating..." : "Submit"}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}

function ImportVideoButton({
  setVideoData,
}: {
  setVideoData: React.Dispatch<React.SetStateAction<VideoSubmitData>>;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [buttonText, setButtonText] = useState("Import Video");

  const getUploadUrl = trpc.videos.getVideoUploadUrl.useMutation();

  const handleImagePick = async () => {
    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to enable camera permissions to take a photo."
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });

      if (!result.canceled) {
        const selectedVideo = result.assets[0];
        const videoUri = selectedVideo.uri;

        setIsUploading(true);
        setButtonText("Uploading...");
        try {
          // Determine content type based on file extension
          const isMovFile = videoUri.toLowerCase().endsWith(".mov");
          const contentType = isMovFile ? "video/quicktime" : "video/mp4";

          const result = await getUploadUrl.mutateAsync({
            videoFilename: `video-${
              isMovFile ? Date.now() + ".mov" : Date.now() + ".mp4"
            }`,
          });

          if (!result?.uploadUrl) {
            console.error("No upload URL received");
            return;
          }

          let videoBlob: Blob;
          if (Platform.OS === "android") {
            const response = await fetch(videoUri);
            videoBlob = await response.blob();
          } else {
            // On iOS, we can create a blob from the file URI
            videoBlob = await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = function () {
                resolve(xhr.response);
              };
              xhr.onerror = function () {
                reject(new Error("Failed to convert image to blob"));
              };
              xhr.responseType = "blob";
              xhr.open("GET", videoUri, true);
              xhr.send(null);
            });
          }

          const uploadResponse = await fetch(result.uploadUrl, {
            method: "PUT",
            body: videoBlob,
            headers: {
              "Content-Type": contentType,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload to S3");
          }

          setVideoData((prev) => ({
            ...prev,
            videoUrl: result.fileUrl,
          }));

          setButtonText("Video Imported!");
        } catch (error) {
          Alert.alert(
            "Upload Failed",
            "Failed to upload image. Please try again."
          );
          console.error("Upload error:", error);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
      console.error("video picker error:", error);
      setButtonText("Import Video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View>
      <Button variant="outline" onPress={handleImagePick} className="">
        <Text className="">{buttonText}</Text>
      </Button>
    </View>
  );
}

type Photo = {
  id: string;
  uri: string;
};

function PhotoGallery({
  setImageLinks,
}: {
  setImageLinks: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

          setIsUploading(true);
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
        disabled={isUploading}
      >
        <Text className="">
          {photos.length === 0 ? "Add Photos" : "Add More Photos"}
        </Text>
      </Button>
    </View>
  );
}
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
