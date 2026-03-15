import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Meal } from "../types";

interface Props {
  meal: Meal;
}

const mealTypeColors: Record<string, string> = {
  breakfast: "#FF9800",
  lunch: "#4CAF50",
  dinner: "#2196F3",
  snack: "#9C27B0",
};

export default function MealCard({ meal }: Props) {
  const router = useRouter();

  const badgeColor = mealTypeColors[meal.meal_type] ?? "#757575";
  const foodNames =
    meal.food_items?.map((item) => item.name).join(", ") ?? "No items detected";

  const imageUri = meal.image_path
    ? meal.image_path.startsWith("http")
      ? meal.image_path
      : `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000"}/${meal.image_path}`
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/meal/${meal.id}`)}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Photo</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>
              {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
            </Text>
          </View>
          <Text style={styles.time}>{meal.time}</Text>
        </View>

        <Text style={styles.foods} numberOfLines={2}>
          {foodNames}
        </Text>

        <Text style={styles.calories}>
          {meal.calories != null ? `${Math.round(meal.calories)} kcal` : "--"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 90,
    height: 90,
  },
  placeholder: {
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#9E9E9E",
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  foods: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  calories: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
});
