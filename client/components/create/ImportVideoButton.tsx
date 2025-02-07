import { useState } from "react";
import {
  View,
  Text,
  Alert,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "../../trpc/client";
import type { VideoSubmitData } from "../../../packages/api-types";
import { Button } from "~/components/ui/button";

export function ImportVideoButton({
  setVideoData,
  buttonText,
  setButtonText,
}: {
  setVideoData: React.Dispatch<React.SetStateAction<VideoSubmitData>>;
  buttonText: string;
  setButtonText: React.Dispatch<React.SetStateAction<string>>;
}) {
  // const [isUploading, setIsUploading] = useState(false);
  // const [buttonText, setButtonText] = useState("Import Video");

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

        // setIsUploading(true);
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
      // setIsUploading(false);
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
