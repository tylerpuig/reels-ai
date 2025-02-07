import Chat from "../../../components/chat/Chat";
import { useLocalSearchParams } from "expo-router";

export default function ChatModal() {
  const { id, agentId, agentPhoto, agentName } = useLocalSearchParams<{
    id: string;
    agentId: string;
    agentPhoto: string;
    agentName: string;
  }>();
  return (
    <Chat
      conversationId={Number(id)}
      agentId={agentId}
      agentPhoto={agentPhoto}
      agentName={agentName}
    />
  );
}
