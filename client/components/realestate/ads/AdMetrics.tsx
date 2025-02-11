import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface AdMetric {
  date: string;
  value: number;
}

type AdMetricsProps = {
  adId: number;
};

const mockData = {
  impressions: [
    { date: "10 Apr", value: 240 },
    { date: "11 Apr", value: 280 },
    { date: "12 Apr", value: 350 },
    { date: "13 Apr", value: 370 },
    { date: "14 Apr", value: 290 },
    { date: "15 Apr", value: 220 },
  ],
  clicks: [
    // Similar structure for clicks data
  ],
  spend: [
    // Similar structure for spend data
  ],
  totalImpressions: 1750,
  totalClicks: 125,
  totalSpend: 450,
};

export const AdMetrics = ({ adId }: AdMetricsProps) => {
  const maxValue = Math.max(...mockData.impressions.map((i) => i.value));
  const spacing = Math.ceil(maxValue / 5 / 100) * 100;

  console.log("adId: ", adId);

  const renderDot = () => {
    return (
      <View
        style={{
          height: 20,
          width: 20,
          borderRadius: 10,
          backgroundColor: "#0a0a0a",
          borderWidth: 3,
          borderColor: "#22c55e",
        }}
      />
    );
  };

  return (
    <View className="flex-1 bg-[#0a0a0a] p-5">
      {/* Metrics Summary */}
      <View className="flex-row justify-between items-center py-4 px-5 bg-zinc-900 rounded-xl mb-6">
        <View className="items-center flex-1">
          <Text className="text-lg font-bold text-white mb-1">
            {mockData.totalImpressions.toLocaleString()}
          </Text>
          <Text className="text-xs text-zinc-400">Impressions</Text>
        </View>
        <View className="w-px h-8 bg-zinc-800" />
        <View className="items-center flex-1">
          <Text className="text-lg font-bold text-white mb-1">
            {mockData.totalClicks.toLocaleString()}
          </Text>
          <Text className="text-xs text-zinc-400">Clicks</Text>
        </View>
        <View className="w-px h-8 bg-zinc-800" />
        <View className="items-center flex-1">
          <Text className="text-lg font-bold text-white mb-1">
            ${mockData.totalSpend.toLocaleString()}
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
          data={mockData.impressions.map((i) => ({
            value: i.value,
            dataPointText: i.value.toString(),
            label: i.date,
          }))}
          height={200}
          spacing={spacing}
          initialSpacing={10}
          color="#22c55e"
          thickness={2}
          maxValue={maxValue}
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
          //   renderDataPoint={renderDot}
          //   customDataPoint={renderDot}
          focusEnabled
          //   CustomLine={() => (
          //     <LinearGradient
          //       start={{ x: 0, y: 0 }}
          //       end={{ x: 0, y: 1 }}
          //       colors={["#22c55e", "#22c55e10"]}
          //       style={{
          //         flex: 1,
          //         borderRadius: 16,
          //       }}
          //     />
          //   )}
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: "#27272a",
            pointerStripWidth: 2,
            pointerColor: "#22c55e",
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 90,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: false,
            pointerLabelComponent: (items) => {
              const item = items[0];
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
