import { Text, View, Linking, TouchableOpacity } from "react-native";
import { Calendar } from "lucide-react-native";

export type EventMetadata = {
  eventDetails: {
    title: string;
    startDate: string;
    endDate: string;
    description: string;
  };
  eventScheduled: boolean;
};

function formatGoogleCalendarDate(dateString: string) {
  const date = new Date(dateString);
  return (
    date
      .toISOString()
      .replace(/-|:|\./g, "")
      .slice(0, 15) + "Z"
  );
}

async function openToCalendar(event: EventMetadata["eventDetails"]) {
  try {
    const encodedTitle = encodeURIComponent(event?.title ?? "");
    const startDate = formatGoogleCalendarDate(event.startDate);
    const endDate = formatGoogleCalendarDate(event.endDate);
    const encodedLocation = encodeURIComponent("Austin");
    const encodedDescription = encodeURIComponent(event.description);

    await Linking.openURL(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startDate}/${endDate}&location=${encodedLocation}&details=${encodedDescription}`
    );
  } catch (error) {
    console.error("Error opening calendar:", error);
  }
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  } catch (_) {}

  return "";
};

export const EventConfirmation = ({
  metadata,
  isUserMessage,
}: {
  metadata: EventMetadata;
  isUserMessage: boolean;
}) => {
  if (!metadata?.eventDetails || !metadata?.eventScheduled) return null;

  const { title, startDate } = metadata.eventDetails;

  return (
    <TouchableOpacity
      onPress={() => {
        openToCalendar(metadata.eventDetails);
      }}
    >
      <View
        className={`
      flex-row 
      items-center 
      gap-3
      mt-2 
      p-3 
      mb-3
      rounded-xl
      ${isUserMessage ? "bg-gray-100" : "bg-zinc-600"}
    `}
      >
        <Calendar
          size={20}
          className={isUserMessage ? "text-gray-600" : "text-gray-300"}
        />
        <View>
          <Text
            className={`
          font-medium 
          ${isUserMessage ? "text-gray-800" : "text-gray-200"}
        `}
          >
            {title}
          </Text>
          <Text
            className={`
          text-sm 
          ${isUserMessage ? "text-gray-600" : "text-gray-300"}
        `}
          >
            Scheduled for {formatDate(startDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
