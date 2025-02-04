import { View, Text, Image, StyleSheet } from "react-native";

interface CommentProps {
  username: string;
  profilePhoto: string;
  comment: string;
  timestamp: string;
}

export default function Comment({
  username,
  profilePhoto,
  comment,
  timestamp,
}: CommentProps) {
  return (
    <View style={styles.commentContainer}>
      <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
      <View style={styles.commentContent}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.commentText}>{comment}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  commentText: {
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
});
