import React from "react";
import { TouchableOpacity, Text, Platform, Linking } from "react-native";

export const AddToCalendarButton = ({
  title = "Test Event",
  startDate = new Date(),
  endDate = new Date(Date.now() + 60 * 60 * 1000),
  location = "Austin",
  description = "Meeting notes",
}) => {
  const openCalendar = async () => {
    // Try different URL schemes for iOS

    await Linking.openURL(
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Test%20Event&dates=20250208T175521Z/20250208T185521Z&location=Austin&details=Meeting%20notes"
    );
  };

  return (
    <TouchableOpacity
      onPress={openCalendar}
      style={{
        backgroundColor: "#007AFF",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 16 }}>Add to Calendar</Text>
    </TouchableOpacity>
  );
};

export const EventScreen = () => {
  return <AddToCalendarButton />;
};
