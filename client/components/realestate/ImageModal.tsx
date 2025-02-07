import { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { requestImage } from "../realestate/integrations/decor8/utils";
import { Button } from "~/components/ui/button";
import ImageComparisonSlider from "./ImageComparisonSlider";

interface ImageModalProps {
  images: {
    id: number;
    url: string;
  }[];
}

export default function ImageModal({ images }: ImageModalProps) {
  const [selectedImage, setSelectedImage] = useState<{
    id: number;
    url: string;
  } | null>(null);
  const [promptText, setPrompText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sliderEnabled, setSliderEnabled] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const imageWidth = (screenWidth - 40 - 8) / 2;

  async function makeRequest() {
    try {
      setIsGenerating(true);
      if (!selectedImage?.url) return;

      const response = await requestImage(promptText, selectedImage.url);

      if (!response) return;

      const image = response.info.images[0];
      setGeneratedImage(image.url);
      setSliderEnabled(true);
    } catch (err) {
      console.log(err);
    } finally {
      setIsGenerating(false);
    }
  }

  function closeModal() {
    setSelectedImage(null);
    setGeneratedImage(null);
    setSliderEnabled(false);
    setPrompText("");
  }

  return (
    <View style={styles.container}>
      {/* Image Grid */}
      <View style={styles.grid}>
        {images.map((image, index) => (
          <TouchableOpacity
            key={image.id}
            style={[styles.imageContainer, { width: imageWidth }]}
            onPress={() => {
              // if (!image) return;
              setSelectedImage(image);
            }}
          >
            <Image
              source={{ uri: image.url }}
              style={[styles.thumbnail, { width: imageWidth }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Home Image</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView
              scrollEnabled={!sliderEnabled}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.sliderContainer}>
                <ImageComparisonSlider
                  originalImage={selectedImage?.url ?? ""}
                  generatedImage={generatedImage}
                  sliderEnabled={sliderEnabled}
                />
              </View>
              <Text style={styles.visionText}>What's your vision?</Text>
              <View
                style={{
                  position: "relative", // Container for TextInput and mic icon
                  width: "100%",
                }}
              >
                <TextInput
                  placeholder="Add a comment about this image..."
                  placeholderTextColor="#666"
                  value={promptText}
                  onChangeText={setPrompText}
                  style={[
                    styles.input,
                    { paddingRight: 50 }, // Add padding to prevent text from going under the icon
                  ]}
                  multiline
                />
                <TouchableOpacity
                  onPress={() => {
                    // Add your voice recording logic here
                    console.log("Mic pressed");
                  }}
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "#f0f0f0",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="mic-outline" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              {/* <TextInput
                placeholder="Add a comment about this image..."
                placeholderTextColor="#666"
                value={promptText}
                onChangeText={setPrompText}
                style={styles.input}
                multiline
              /> */}

              <Button
                className="bg-blue-500 mt-4"
                onPress={makeRequest}
                variant="default"
              >
                <Text className="text-white">
                  {isGenerating ? "Generating..." : "Generate"}
                </Text>
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 20,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  thumbnail: {
    height: 150,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "flex-end",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  visionText: {
    fontSize: 18,
    color: "white",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    color: "white",
    backgroundColor: "#1a1a1a",
  },
});
