import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import Voice from "@react-native-voice/voice";

type VoiceInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  style?: any;
};
export default function VoiceInput({
  value,
  onChangeText,
  placeholder,
  style,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);

  //   useEffect(() => {
  //     // Initialize voice recognition
  //     Voice.onSpeechStart = onSpeechStart;
  //     Voice.onSpeechEnd = onSpeechEnd;
  //     Voice.onSpeechResults = onSpeechResults;
  //     Voice.onSpeechError = onSpeechError;

  //     return () => {
  //       // Cleanup
  //       Voice.destroy().then(Voice.removeAllListeners);
  //     };
  //   }, []);

  const onSpeechStart = () => {
    setIsListening(true);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  //   const onSpeechResults = (e) => {
  //     // Get the most confident result
  //     if (e.value && e.value[0]) {
  //       onChangeText(e.value[0]);
  //     }
  //   };

  //   const onSpeechError = (e) => {
  //     console.error(e);
  //     setIsListening(false);
  //   };

  const startRecording = async () => {
    try {
      if (isListening) {
        // await Voice.stop();
        setIsListening(false);
      } else {
        // await Voice.start("en-US");
        setIsListening(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        style={styles.input}
        multiline
      />
      <TouchableOpacity
        onPress={startRecording}
        style={[styles.micButton, isListening && styles.micButtonActive]}
      >
        <Ionicons
          name={isListening ? "mic" : "mic-outline"}
          size={24}
          color={isListening ? "#fff" : "#666"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  input: {
    width: "100%",
    minHeight: 100,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    paddingRight: 50, // Make space for the mic button
    color: "#000",
  },
  micButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  micButtonActive: {
    backgroundColor: "#ff4444",
  },
});
