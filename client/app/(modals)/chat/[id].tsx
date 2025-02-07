import Chat from "../../../components/chat/Chat";
import { useLocalSearchParams } from "expo-router";

export default function ChatModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Chat conversationId={id} />;
}
