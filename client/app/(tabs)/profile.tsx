import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Separator } from "~/components/ui/separator";
import { useRouter } from "expo-router";
import { useSessionStore } from "../../hooks/useSession";
import { supabase } from "../../lib/supabase";
import { trpc } from "../../trpc/client";

const ProfileMenuItem = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center px-5 py-4"
  >
    <Ionicons name={icon as any} size={24} color="white" className="mr-3" />
    <Text className="flex-1 text-base text-white">{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="gray" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useSessionStore();
  const { data: profileData } = trpc.user.getUserProfileData.useQuery(
    {
      userId: session?.user?.id ?? "",
    },
    {
      refetchOnMount: true,
    }
  );

  const menuItems = [
    { label: "Edit Profile", icon: "person-outline", route: "/edit-profile" },
    { label: "Manage Settings", icon: "settings-outline", route: "/settings" },
    { label: "Manage Ads", icon: "megaphone-outline", route: "/manage-ads" },
    {
      label: "Saved Listings",
      icon: "heart-outline",
      route: "/saved-listings",
    },
    { label: "Payment Methods", icon: "card-outline", route: "/payments" },
    { label: "Help & Support", icon: "help-circle-outline", route: "/support" },
  ];

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <View className="px-5 pt-20 pb-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-semibold text-white">Profile</Text>
          <TouchableOpacity
            onPress={() => {
              supabase.auth.signOut();
            }}
            className="p-2"
          >
            <Text className="text-red-500 text-xl ">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View className="flex-row items-center">
          <Image
            source={{ uri: profileData?.avatarUrl ?? "" }}
            className="w-20 h-20 rounded-full mr-4"
          />
          <View>
            <Text className="text-lg font-bold text-white">
              {profileData?.name}
            </Text>
            {/* <Text className="text-zinc-400">{session?.user?.email}</Text> */}
          </View>
        </View>
      </View>

      <Separator className="bg-zinc-800" />

      {/* Menu Items */}
      <ScrollView>
        {menuItems.map((item, index) => (
          <View key={item.label}>
            <ProfileMenuItem
              label={item.label}
              icon={item.icon}
              onPress={() => router.push(item.route)}
            />
            {index < menuItems.length - 1 && (
              <Separator className="bg-zinc-800 mx-5" />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
