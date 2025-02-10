import { View, TouchableOpacity, Modal, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useListingStore } from "./useListingStore";
import InteriorDesignerModal from "./InteriorDesignerModal";
import VideoPlayer from "./integrations/3d/VideoPlayer";

export default function ListingImageModal() {
  const {
    setImageModalOpen,
    setSelectedImage,
    setGeneratedImage,
    imageModalOpen,
    selectedTab,
  } = useListingStore();

  function closeModal() {
    setSelectedImage(null);
    setGeneratedImage(null);
    setImageModalOpen(false);
    // setSliderEnabled(false);
    // setPrompText("");
  }

  return (
    <Modal
      visible={imageModalOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ListingPhotoToggle />
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedTab === "designer" ? "Interior Designer" : "3D Viewer"}{" "}
              ✨
            </Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {selectedTab === "designer" && <InteriorDesignerModal />}
          {selectedTab === "3dviewer" && <VideoPlayer />}
          {/* <InteriorDesignerModal /> */}
        </View>
      </View>
    </Modal>
  );
}

function ListingPhotoToggle() {
  const { setSelectedTab, selectedTab } = useListingStore();
  return (
    <View className="absolute top-20 left-0 right-0 z-50 flex-row justify-center">
      <View className="flex-row bg-black/50 rounded-full p-1.5">
        <TouchableOpacity
          onPress={() => setSelectedTab("designer")}
          className={`px-6 py-1.5 ${
            selectedTab === "designer" ? "bg-white rounded-full" : ""
          }`}
        >
          <Text
            className={`${
              selectedTab === "designer" ? "text-black" : "text-white"
            } font-semibold`}
          >
            Designer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab("3dviewer")}
          className={`px-6 py-1.5 ${
            selectedTab === "3dviewer" ? "bg-white rounded-full" : ""
          }`}
        >
          <Text
            className={`${
              selectedTab === "3dviewer" ? "text-black" : "text-white"
            } font-semibold`}
          >
            3D Viewer
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 72,
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
