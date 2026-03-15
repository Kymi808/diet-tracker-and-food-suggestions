import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
}

export default function MacroBar({
  label,
  current,
  goal,
  color,
  unit = "g",
}: Props) {
  const ratio = goal > 0 ? Math.min(current / goal, 1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {Math.round(current)}{unit} / {Math.round(goal)}{unit}
        </Text>
      </View>
      <View style={styles.trackOuter}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  values: {
    fontSize: 13,
    color: "#757575",
  },
  trackOuter: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 4,
  },
});
