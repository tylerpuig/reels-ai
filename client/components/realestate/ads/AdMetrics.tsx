import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { trpc } from "../../../trpc/client";

type SingleAdMetricsProps = {
  adId: number;
};

export const SingleAdMetrics = ({ adId }: SingleAdMetricsProps) => {
  const { data: adMetrics } = trpc.ads.getAdMetrics.useQuery({
    adId: Number(adId),
  });
  const maxValue = Math.max(
    ...(adMetrics?.impressions ?? []).map((i) => i.impressions)
  );
  const spacing = Math.ceil(maxValue / 5 / 100) * 100;

  const totalClicks = adMetrics?.impressions.reduce((acc, cur) => {
    return acc + cur.clicks;
  }, 0);

  const totalImpressions = adMetrics?.impressions.reduce((acc, cur) => {
    return acc + cur.impressions;
  }, 0);

  const totalSpend = (Number(adMetrics?.adDetails?.dailyBudget) ?? 0) * 7;

  const chartData = (adMetrics?.impressions ?? [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort chronologically
    .map((el) => ({
      value: el.impressions,
      dataPointText: el.impressions.toString(),
      textColor: "white",
      label: new Date(el.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      date: new Date(el.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

  return (
    <View className="flex-1 bg-[#0a0a0a] p-5">
      {/* Metrics Summary */}
      <View className="flex-row justify-between items-center py-4 px-5 bg-zinc-900 rounded-xl mb-6">
        <View className="items-center flex-1">
          <Text className="text-lg font-bold text-white mb-1">
            {(totalImpressions ?? 0).toLocaleString()}
          </Text>
          <Text className="text-xs text-zinc-400">Impressions</Text>
        </View>
        <View className="w-px h-8 bg-zinc-800" />
        <View className="items-center flex-1">
          <Text className="text-lg font-bold text-white mb-1">
            {(totalClicks ?? 0).toLocaleString()}
          </Text>
          <Text className="text-xs text-zinc-400">Clicks</Text>
        </View>
        <View className="w-px h-8 bg-zinc-800" />
        <View className="items-center flex-1">
          <Text className="text-lg font-bold text-white mb-1">
            ${totalSpend.toLocaleString()}
          </Text>
          <Text className="text-xs text-zinc-400">Spend</Text>
        </View>
      </View>

      {/* Chart */}
      <View className="bg-zinc-900 rounded-xl p-4">
        <Text className="text-base font-semibold text-white mb-4">
          Impressions Over Time
        </Text>
        <LineChart
          areaChart
          data={chartData}
          height={200}
          // spacing={spacing}
          spacing={60}
          initialSpacing={10}
          color="#22c55e"
          thickness={2}
          maxValue={maxValue + 200}
          noOfSections={5}
          yAxisTextStyle={{ color: "#a1a1aa" }}
          xAxisLabelTextStyle={{ color: "#a1a1aa" }}
          hideDataPoints={false}
          dataPointsColor="#22c55e"
          startFillColor="#22c55e"
          endFillColor="#22c55e10"
          startOpacity={0.3}
          endOpacity={0.1}
          rulesColor="#27272a"
          yAxisColor="transparent"
          xAxisColor="transparent"
          hideYAxisText={false}
          focusEnabled
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: "#27272a",
            pointerStripWidth: 2,
            pointerColor: "#22c55e",
            // pointerColor: "#FFFFFF",
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 90,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: false,
            pointerLabelComponent: (
              items: { value: number; date: string }[]
            ) => {
              const item = items?.[0] ?? { value: 0, date: "" };
              return (
                <View className="bg-zinc-800 p-2 rounded-lg">
                  <Text className="text-white text-xs">{item.date}</Text>
                  <Text className="text-white font-bold">
                    {item.value.toLocaleString()}
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>
    </View>
  );
};
