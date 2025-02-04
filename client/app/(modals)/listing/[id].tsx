import HomeListing from "../../../components/realestate/Listing";
import { useLocalSearchParams } from "expo-router";

export default function ProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <HomeListing listingId={id} />;
}
