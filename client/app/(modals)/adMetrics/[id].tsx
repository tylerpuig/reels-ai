import { AdMetrics } from "../../../components/realestate/ads/AdMetrics";
import { useLocalSearchParams } from "expo-router";
export default function AdMetricsModal() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  return <AdMetrics adId={Number(id)} />;
}
