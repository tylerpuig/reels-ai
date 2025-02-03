import { Text, View } from "react-native";
import { trpc } from "../trpc";
import { Button } from "~/components/ui/button";

export default function Example() {
  const { data } = trpc.greeting.greeting.useQuery({
    name: "testing",
  });

  return (
    <View className="">
      <Text className="!text-red-300">Testing {data?.greeting ?? ""}</Text>
      <Button>
        <Text className="text-white">Click me</Text>
      </Button>
    </View>
  );
}
