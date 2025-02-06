import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, Platform } from "react-native";
import ContactModal from "../realestate/ContactAgentModal";
import ImageModal from "../realestate/ImageModal";
import { trpc } from "../../trpc/client";
import { useSessionStore } from "../../hooks/useSession";
import { usePathname } from "expo-router";

type HouseListingProps = {
  listingId: string;
};

function formatPhoneNumber(phonNumber: string): string {
  try {
    if (!phonNumber) return "";
    const cleaned = phonNumber.toString().replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phonNumber;
  } catch (_) {}
  return "";
}

const images: { id: string; uri: string }[] = [
  {
    id: "1",
    uri: "https://na.rdcpix.com/8c0c5a1ca9e8c800cf7d6996f7e8c075w-c4132190752rd-w832_h468_r4_q80.webp",
  },
  {
    id: "2",
    uri: "https://na.rdcpix.com/b8f337dcf063a3dd34623edd77485fdew-c4258344017rd-w832_q80.jpg",
  },
  {
    id: "3",
    uri: "https://na.rdcpix.com/40375f3fda3c1218fdf8b3131ae2b8fdw-c4086160332rd-w832_q80.jpg",
  },
  {
    id: "4",
    uri: "https://na.rdcpix.com/b6e77db8f028b36bce82a41affba51cdw-c611782258rd-w832_q80.jpg",
  },
];

type ListingFeatureProps = {
  icon: string;
  label: string;
  value: string | number;
};

export default function HomeListing({ listingId }: HouseListingProps) {
  const router = useRouter();
  const { session } = useSessionStore();
  const pathname = usePathname();
  const [showContactModal, setShowContactModal] = useState(false);

  const { data: listingData, isLoading } =
    trpc.listings.getListingDetails.useQuery({
      listingId: Number(listingId),
    });

  const { data: isLiked, refetch: refetchIsLiked } =
    trpc.listings.isListingLikedByUser.useQuery({
      listingId: Number(listingId),
      userId: session?.user?.id ?? "",
    });

  const updateListingLike = trpc.listings.updateListingLike.useMutation({
    onSuccess: () => {
      refetchIsLiked();
    },
  });

  useEffect(() => {
    refetchIsLiked();
  }, [pathname]);

  if (!listingData || isLoading) {
    return null;
  }

  const makePhoneCall = (phoneNumber: string) => {
    try {
      // Remove any non-numeric characters from the phone number
      const cleanNumber = phoneNumber.replace(/[^\d]/g, "");

      // Create the phone URL scheme
      const url = Platform.select({
        ios: `telprompt:${cleanNumber}`,
        android: `tel:${cleanNumber}`,
      });

      if (!url) return;

      // Check if the device can handle the phone URL scheme
      Linking.canOpenURL(url)
        .then((supported) => {
          if (!supported) {
            console.log("Phone number is not available");
            // Handle the case where phone calls aren't supported
          } else {
            return Linking.openURL(url);
          }
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  };

  const Feature = ({ value, label }: ListingFeatureProps) => (
    <View className="items-center flex-1">
      {/* <Ionicons size={12} color="white" /> */}
      <Text className="text-lg font-bold text-white">{value}</Text>
      <Text className="text-xs text-zinc-400">{label}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#0a0a0a] pt-6">
      {/* Header */}
      <View className="flex-row items-center pt-12 px-5 pb-3 border-b border-zinc-800">
        <TouchableOpacity className="p-1 z-10" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4 text-white">
          Property Details
        </Text>
        <TouchableOpacity
          onPress={() => {
            updateListingLike.mutate({
              listingId: Number(listingId),
              userId: session?.user?.id ?? "",
              action: isLiked?.isLiked ? "unlike" : "like",
            });
          }}
          className="ml-auto p-1"
        >
          <Ionicons
            name={isLiked?.isLiked ? "heart" : "heart-outline"}
            size={24}
            color="red"
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="py-4">
          <ImageModal images={listingData?.images ?? []} />
          {/* <FlatList
            data={listing.images}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            className="pl-5"
          /> */}
        </View>

        {/* Price and Address */}
        <View className="px-5 pb-4">
          <Text className="text-3xl font-bold text-white mb-2">
            {"$" + (listingData?.listing.price ?? "").toLocaleString("en-US")}
          </Text>
          <Text className="text-lg text-white mb-1">
            {listingData?.listing.address}
          </Text>
          <Text className="text-base text-zinc-400">
            {listingData?.listing.city}, {listingData?.listing.state}{" "}
            {listingData?.listing.zip}
          </Text>
        </View>

        {/* Features */}
        <View className="flex-row justify-between items-center mx-5 py-2 px-5 bg-zinc-900 rounded-xl mb-4">
          <Feature
            icon="bed-outline"
            value={listingData?.listing.beds}
            label="Beds"
          />
          <View className="w-px h-8 bg-zinc-800" />
          <Feature
            icon="water-outline"
            value={listingData?.listing.baths}
            label="Baths"
          />
          <View className="w-px h-8 bg-zinc-800" />
          <Feature
            icon="square-outline"
            value={listingData?.listing.sqft}
            label="Sq Ft"
          />
        </View>

        {/* Description */}
        <View className="px-5 mb-4">
          <Text className="text-lg font-semibold text-white mb-2">
            About This Home
          </Text>
          <Text className="text-base text-zinc-400 leading-6">
            {listingData?.listing.description}
          </Text>
        </View>

        {/* Listing Agent */}
        <View className="px-5 py-4 bg-zinc-900 mx-5 rounded-xl mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            Listed By
          </Text>
          <View className="flex-row items-center">
            <Image
              source={{ uri: listingData?.user?.avatarUrl ?? "" }}
              className="w-16 h-16 rounded-full mr-4"
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white mb-1">
                {listingData?.user?.name ?? ""}
              </Text>
              <Text className="text-sm text-zinc-400 mb-1">
                {listingData?.listing?.agentAgency ?? ""}
              </Text>
              <Text className="text-sm text-zinc-400">
                {formatPhoneNumber(listingData?.listing.agentPhone ?? "")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                makePhoneCall(listingData?.listing.agentPhone ?? "");
              }}
              className="bg-white rounded-full p-3"
            >
              <Ionicons name="call" size={24} color="#0a0a0a" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Contact Button */}
      <View className="p-5 border-t border-zinc-800 mb-4">
        <TouchableOpacity
          onPress={() => {
            setShowContactModal(true);
          }}
          className="bg-white py-4 rounded-xl items-center"
        >
          <Text className="text-base font-semibold text-black">
            Contact Agent
          </Text>
        </TouchableOpacity>
      </View>

      <ContactModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        agentName={listingData?.listing?.agentName ?? ""}
        propertyAddress={listingData?.listing?.address ?? ""}
      />
    </View>
  );
}
