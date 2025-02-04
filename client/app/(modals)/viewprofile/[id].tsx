// app/(modals)/profile/[id].tsx
import ViewProfile from "../../../components/profile/ViewProfile";
import { useLocalSearchParams } from "expo-router";

export default function ProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ViewProfile userId={id} />;
}
