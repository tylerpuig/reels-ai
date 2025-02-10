import { useState, useRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { Button } from "~/components/ui/button";
import { useListingStore } from "../../useListingStore";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

export default function VideoPlayer() {
  const [status, setStatus] = useState<any>({});
  const video = useRef<ExpoVideo | null>(null);
  const { selectedImage } = useListingStore();
  console.log(selectedImage);

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>{"Test"}</Text> */}
      <View style={styles.videoContainer}>
        <ExpoVideo
          ref={video}
          style={styles.video}
          source={{
            uri: getVideoForImage(selectedImage?.url ?? ""),
          }}
          useNativeControls
          shouldPlay
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={setStatus}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    // padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  videoContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  video: {
    width: "100%",
    height: 300,
  },
});

function getVideoForImage(url: string) {
  try {
    if (url.includes("9a8a6422699e779e005b63c45523cc66")) {
      return "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/tmp_rdx2y08.mp4";
    }

    if (url.includes("a7a598a37b279dcdcac15a26d4abe9f9")) {
      return "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/tmpcpxztnbl.mp4";
    }

    if (url.includes("3b67177ffd4a4ecfee004b471f63638f")) {
      return "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/tmpjr8moydr.mp4";
    }

    if (url.includes("a50e286e978e77a44d88385f3d1147db")) {
      return "https://replicate.delivery/xezq/IyOsSYdbGqbrD18lTPJUfvBQWeYXgrQADNOQHnZh74nU6BOUA/tmpc8rjdzxu.mp4";
    }
  } catch (err) {}
  return "https://reels-ai-3283432784.s3.us-east-1.amazonaws.com/tmpcpxztnbl.mp4";
}
