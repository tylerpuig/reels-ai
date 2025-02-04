import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const windowWidth = Dimensions.get("window").width;

interface HouseListingProps {
  listingId: string;
}

export default function HomeListing({ listingId }: HouseListingProps) {
  const router = useRouter();

  // Mock data - in a real app, this would come from an API
  const listing = {
    price: "$849,000",
    address: "123 Maple Street",
    city: "Beverly Hills",
    state: "CA",
    zip: "90210",
    beds: 4,
    baths: 3,
    sqft: "2,450",
    description:
      "Stunning modern home featuring an open concept living space, gourmet kitchen with premium appliances, and a spacious primary suite. The backyard offers a peaceful retreat with mature landscaping and a covered patio perfect for entertaining.",
    agent: {
      name: "Sarah Johnson",
      photo: "https://placekitten.com/200/200",
      phone: "(555) 123-4567",
      agency: "Luxury Real Estate Group",
    },
    images: [
      { id: "1", uri: "https://placekitten.com/800/600" },
      { id: "2", uri: "https://placekitten.com/801/600" },
      { id: "3", uri: "https://placekitten.com/802/600" },
      { id: "4", uri: "https://placekitten.com/803/600" },
    ],
  };

  const renderImageItem = ({ item, index }) => (
    <Image source={{ uri: item.uri }} className="w-80 h-60 rounded-lg mr-4" />
  );

  const Feature = ({ icon, value, label }) => (
    <View className="items-center flex-1">
      <Ionicons name={icon} size={24} color="white" />
      <Text className="text-lg font-bold text-white mb-1">{value}</Text>
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
        <TouchableOpacity className="ml-auto p-1">
          <Ionicons name="heart-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="py-4">
          <FlatList
            data={listing.images}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            className="pl-5"
          />
        </View>

        {/* Price and Address */}
        <View className="px-5 pb-4">
          <Text className="text-3xl font-bold text-white mb-2">
            {listing.price}
          </Text>
          <Text className="text-lg text-white mb-1">{listing.address}</Text>
          <Text className="text-base text-zinc-400">
            {listing.city}, {listing.state} {listing.zip}
          </Text>
        </View>

        {/* Features */}
        <View className="flex-row justify-between items-center mx-5 py-4 px-5 bg-zinc-900 rounded-xl mb-4">
          <Feature icon="bed-outline" value={listing.beds} label="Beds" />
          <View className="w-px h-8 bg-zinc-800" />
          <Feature icon="water-outline" value={listing.baths} label="Baths" />
          <View className="w-px h-8 bg-zinc-800" />
          <Feature icon="square-outline" value={listing.sqft} label="Sq Ft" />
        </View>

        {/* Description */}
        <View className="px-5 mb-4">
          <Text className="text-lg font-semibold text-white mb-2">
            About This Home
          </Text>
          <Text className="text-base text-zinc-400 leading-6">
            {listing.description}
          </Text>
        </View>

        {/* Listing Agent */}
        <View className="px-5 py-4 bg-zinc-900 mx-5 rounded-xl mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            Listed By
          </Text>
          <View className="flex-row items-center">
            <Image
              source={{ uri: listing.agent.photo }}
              className="w-16 h-16 rounded-full mr-4"
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white mb-1">
                {listing.agent.name}
              </Text>
              <Text className="text-sm text-zinc-400 mb-1">
                {listing.agent.agency}
              </Text>
              <Text className="text-sm text-zinc-400">
                {listing.agent.phone}
              </Text>
            </View>
            <TouchableOpacity className="bg-white rounded-full p-3">
              <Ionicons name="call" size={24} color="#0a0a0a" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Contact Button */}
      <View className="p-5 border-t border-zinc-800">
        <TouchableOpacity className="bg-white py-4 rounded-xl items-center">
          <Text className="text-base font-semibold text-black">
            Contact Agent
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
