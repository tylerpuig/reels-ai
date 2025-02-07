import { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  ScrollView,
  Alert,
  Keyboard,
  StyleSheet,
} from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { trpc } from "../../trpc/client";
import type {
  ListingFormData,
  VideoSubmitData,
} from "../../../packages/api-types";
import { useSessionStore } from "../../hooks/useSession";
import { ImportVideoButton } from "../../components/create/ImportVideoButton";
import { PhotoGallery } from "../../components/create/PhotoGallery";
import * as listingUtils from "../../components/create/utils";
import { useRouter } from "expo-router";

export default function ListingForm() {
  const { session } = useSessionStore();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [videoData, setVideoData] = useState<VideoSubmitData>(
    listingUtils.getBaseVideoFormData()
  );
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const [imageLinks, setImageLinks] = useState<string[]>([]);
  const [formData, setFormData] = useState<ListingFormData>(
    listingUtils.getBaseListingFormData()
  );

  const createListing = trpc.listings.createNewListing.useMutation({
    onSuccess: () => {
      Alert.alert("Success", "Listing created successfully!");
      router.push("/");
    },
    onError: () => {
      Alert.alert("Error", "Failed to create listing. Please try again.");
    },
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardWillShow", () => {
      setKeyboardPadding(60);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd();
      }
    });
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardPadding(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    keyboardView: {
      marginBottom: keyboardPadding,
    },
  });

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
    <ScrollView
      className="flex-1 bg-[#0a0a0a] px-4 mt-20 mb-24"
      ref={scrollViewRef}
    >
      <Accordion
        type="multiple"
        collapsible
        // "home-info", "listing-details"
        defaultValue={[]}
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

            <View style={styles.keyboardView}>
              {renderInput("Agent Phone", "agentPhone", "(555) 555-5555")}
              {renderInput("Agency", "agentAgency", "Enter agency name")}
            </View>

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
