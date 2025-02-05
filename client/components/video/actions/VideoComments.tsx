import { View, Text } from "react-native";
import { Button } from "~/components/ui/button";
import { MessageCircle } from "lucide-react-native";
import { useVideoStore } from "../useVideoStore";
import { type VideoData } from "../../../trpc/types";

const styles = {
  buttonText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
};
export default function VideoComments({ video }: { video: VideoData }) {
  const { setIsCommentsVisible, setActiveVideoId } = useVideoStore();
  return (
    <View style={{ alignItems: "center" }}>
      <Button
        onPress={() => {
          setIsCommentsVisible(true);
          setActiveVideoId(video.id);
        }}
        variant="default"
        size="icon"
        className="bg-transparent"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </Button>
      <Text style={styles.buttonText}>{video.commentCount}</Text>
    </View>
  );
}
