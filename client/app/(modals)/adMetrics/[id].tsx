import { SingleAdMetrics } from "../../../components/realestate/ads/AdMetrics";
import { useLocalSearchParams } from "expo-router";
export default function AdMetricsModal() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  return <SingleAdMetrics adId={Number(id)} />;
}
