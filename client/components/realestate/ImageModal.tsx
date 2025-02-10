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
import ListingImageModal from "./ListingImageModal";
import { useListingStore } from "./useListingStore";

interface ImageModalProps {
  images: {
    id: number;
    url: string;
  }[];
}

export default function ImageModal({ images }: ImageModalProps) {
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = (screenWidth - 40 - 8) / 2;
  const { setSelectedImage, setImageModalOpen } = useListingStore();
  // const [selectedImage, setSelectedImage] = useState<{
  //   id: number;
  //   url: string;
  // } | null>(null);

  return (
    <View style={styles.container}>
      {/* Image Grid */}
      <View style={styles.grid}>
        {images.map((image) => (
          <TouchableOpacity
            key={image.id}
            style={[styles.imageContainer, { width: imageWidth }]}
            onPress={() => {
              // if (!image) return;
              setSelectedImage(image);
              setImageModalOpen(true);
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
      <ListingImageModal />
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
