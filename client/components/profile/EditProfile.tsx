import { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSessionStore } from "@/hooks/useSession";
import { trpc } from "../../trpc/client";
import { Button } from "~/components/ui/button";
import * as ImagePicker from "expo-image-picker";

export default function EditProfile() {
  const router = useRouter();
  const { session } = useSessionStore();

  const { data: userProfile, refetch: refetchUserProfile } =
    trpc.user.getUserProfileData.useQuery({
      userId: session?.user?.id ?? "",
    });

  const getPresignedUrl = trpc.user.getPresignedS3Url.useMutation();
  const updateAvatarUrl = trpc.user.updateUserProfileImage.useMutation();
  const updateProfile = trpc.user.updateUserProfile.useMutation();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name,
        email: userProfile.email,
        avatarUrl: userProfile.avatarUrl ?? "",
      });
    }
  }, [userProfile]);

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
      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        const imageUri = selectedImage.uri;

        setIsUploading(true);
        try {
          const s3Data = await getPresignedUrl.mutateAsync({
            fileName: `avatar-${Date.now()}.jpg`,
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

          await updateAvatarUrl.mutateAsync({
            userId: session?.user?.id ?? "",
            url: s3Data.fileUrl,
          });

          setProfileData((prev) => ({
            ...prev,
            avatarUrl: s3Data.fileUrl,
          }));
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
      console.error("Image picker error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = useCallback(() => {
    updateProfile.mutate({
      userId: session?.user?.id ?? "",
      name: profileData.name,
      email: profileData.email,
    });
    // router.back();
  }, [profileData, session]);

  const handleUpdateField = useCallback((field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  return (
    <View className="flex-1 bg-[#0a0a0a] pt-12">
      {/* Header */}
      <View className="flex-row items-center pt-12 px-5 pb-3 border-b border-zinc-800">
        <TouchableOpacity className="p-1 z-10" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4 text-white">
          Edit Profile
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4">
          <View className="space-y-4">
            {/* Profile Image Section */}
            <View className="items-center mb-6">
              <View className="relative">
                <Image
                  source={{
                    uri:
                      profileData.avatarUrl ||
                      "https://via.placeholder.com/100",
                  }}
                  className="w-24 h-24 rounded-full bg-zinc-800"
                />
                <TouchableOpacity
                  className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full"
                  onPress={handleImagePick}
                  disabled={isUploading}
                >
                  <Ionicons
                    name={isUploading ? "hourglass" : "camera"}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
              {isUploading && (
                <Text className="text-zinc-400 mt-2">Uploading...</Text>
              )}
            </View>

            {/* Name Input */}
            <View>
              <Text className="text-zinc-400 mb-2">Name</Text>
              <TextInput
                className="bg-zinc-900 p-4 rounded-xl text-white"
                placeholder="Enter your name"
                placeholderTextColor="#666"
                value={profileData.name}
                onChangeText={(text) => handleUpdateField("name", text)}
              />
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-zinc-400 mb-2 mt-6">Email Address</Text>
              <TextInput
                className="bg-zinc-900 p-4 rounded-xl text-white"
                placeholder="Enter your email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={profileData.email}
                onChangeText={(text) => handleUpdateField("email", text)}
              />
            </View>
          </View>

          <Button
            className="mt-6"
            variant={"outline"}
            onPress={handleSave}
            disabled={isUploading}
          >
            <Text>{updateProfile.isLoading ? "Saving..." : "Save"}</Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
