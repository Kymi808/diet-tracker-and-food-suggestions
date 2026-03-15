import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Props {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export default function CalorieProgressRing({
  consumed,
  goal,
  size = 180,
  strokeWidth = 14,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = goal > 0 ? Math.min(consumed / goal, 1.5) : 0;
  const strokeDashoffset = circumference * (1 - Math.min(ratio, 1));

  let color = "#4CAF50"; // green
  if (ratio > 1) {
    color = "#F44336"; // red — over goal
  } else if (ratio > 0.85) {
    color = "#FF9800"; // orange — approaching goal
  }

  const remaining = Math.max(0, Math.round(goal - consumed));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.consumedText, { color }]}>
          {Math.round(consumed)}
        </Text>
        <Text style={styles.goalText}>/ {Math.round(goal)} kcal</Text>
        <Text style={styles.remainingText}>
          {consumed > goal
            ? `${Math.round(consumed - goal)} over`
            : `${remaining} left`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    position: "absolute",
    alignItems: "center",
  },
  consumedText: {
    fontSize: 32,
    fontWeight: "700",
  },
  goalText: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  remainingText: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 2,
  },
});
