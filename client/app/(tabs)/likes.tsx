import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { type VideoData } from "~/trpc/types";
// import { createThumbnail } from "react-native-create-thumbnail";

export default function Likes() {
  const [activeTab, setActiveTab] = useState("videos");

  // Sample data - replace with your actual data
  const likedVideos = [
    {
      id: 1,
      title: "Amazing Video",
      videoUrl: "https://example.com/video1.mp4",
      thumbnail: "https://example.com/thumb1.jpg",
    },
    // Add more videos...
  ];

  const likedPosts = [
    {
      id: 1,
      title: "Interesting Post",
      content: "This is a great post!",
      image: "https://example.com/image1.jpg",
    },
    // Add more posts...
  ];

  const renderVideoItem = ({ item }: { item: VideoData }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.thumbnailUrl ?? "" }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <Text style={styles.itemTitle}>{item.title}</Text>
    </View>
  );

  const renderPostItem = ({ item }: { item: VideoData }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.thumbnailUrl ?? "" }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.postContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.postText}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container} className="pt-14">
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "videos" && styles.activeTab]}
          onPress={() => setActiveTab("videos")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "videos" && styles.activeTabText,
            ]}
          >
            Videos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "posts" && styles.activeTab]}
          onPress={() => setActiveTab("posts")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "posts" && styles.activeTabText,
            ]}
          >
            Homes
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === "videos" ? (likedVideos as any) : likedPosts}
        renderItem={activeTab === "videos" ? renderVideoItem : renderPostItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
  },
  tabText: {
    color: "#888",
    fontSize: 16,
  },
  activeTabText: {
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  thumbnail: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
  },
  itemTitle: {
    color: "#fff",
    fontSize: 16,
    marginTop: 8,
  },
  postContent: {
    marginTop: 8,
  },
  postText: {
    color: "#888",
    marginTop: 4,
  },
});
