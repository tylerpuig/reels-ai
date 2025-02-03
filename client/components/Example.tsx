import { Image, StyleSheet, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Text } from "react-native";
import { trpc } from "../trpc";
export default function Example() {
  const { data } = trpc.greeting.greeting.useQuery({
    name: "testing",
  });

  return <Text className="!text-red-300">Testing {data?.greeting ?? ""}</Text>;
}
