import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMeal, useDeleteMeal } from "../../hooks/useMeals";
import { reanalyzeMeal } from "../../services/api";
import { useQueryClient } from "@tanstack/react-query";

const mealTypeColors: Record<string, string> = {
  breakfast: "#FF9800",
  lunch: "#4CAF50",
  dinner: "#2196F3",
  snack: "#9C27B0",
};

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const mealQuery = useMeal(mealId);
  const deleteMutation = useDeleteMeal();
  const [reanalyzing, setReanalyzing] = React.useState(false);

  const meal = mealQuery.data;

  async function handleReanalyze() {
    try {
      setReanalyzing(true);
      await reanalyzeMeal(mealId);
      queryClient.invalidateQueries({ queryKey: ["meal", mealId] });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      mealQuery.refetch();
    } catch {
      Alert.alert("Error", "Failed to re-analyze meal.");
    } finally {
      setReanalyzing(false);
    }
  }

  function handleDelete() {
    Alert.alert("Delete Meal", "Are you sure you want to delete this meal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(mealId);
            router.back();
          } catch {
            Alert.alert("Error", "Failed to delete meal.");
          }
        },
      },
    ]);
  }

  if (mealQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Meal not found.</Text>
      </View>
    );
  }

  const badgeColor = mealTypeColors[meal.meal_type] ?? "#757575";

  const imageUri = meal.image_path
    ? meal.image_path.startsWith("http")
      ? meal.image_path
      : `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000"}/${meal.image_path}`
    : null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Image */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>No Photo</Text>
        </View>
      )}

      {/* Meal type & date/time */}
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>
            {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
          </Text>
        </View>
        <Text style={styles.dateTime}>
          {meal.date} at {meal.time}
        </Text>
      </View>

      {/* Calorie & macro breakdown */}
      <View style={styles.macroCard}>
        <Text style={styles.sectionTitle}>Nutrition</Text>
        <View style={styles.macroGrid}>
          <MacroItem
            label="Calories"
            value={meal.calories != null ? `${Math.round(meal.calories)}` : "--"}
            unit="kcal"
            color="#FF5722"
          />
          <MacroItem
            label="Protein"
            value={meal.protein_g != null ? `${Math.round(meal.protein_g)}` : "--"}
            unit="g"
            color="#4CAF50"
          />
          <MacroItem
            label="Carbs"
            value={meal.carbs_g != null ? `${Math.round(meal.carbs_g)}` : "--"}
            unit="g"
            color="#FF9800"
          />
          <MacroItem
            label="Fat"
            value={meal.fat_g != null ? `${Math.round(meal.fat_g)}` : "--"}
            unit="g"
            color="#F44336"
          />
          <MacroItem
            label="Fiber"
            value={meal.fiber_g != null ? `${Math.round(meal.fiber_g)}` : "--"}
            unit="g"
            color="#795548"
          />
        </View>
      </View>

      {/* Food items */}
      {meal.food_items && meal.food_items.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Items</Text>
          {meal.food_items.map((item, index) => (
            <View key={index} style={styles.foodItemRow}>
              <Text style={styles.foodItemName}>{item.name}</Text>
              <Text style={styles.foodItemCal}>
                {item.estimated_calories != null
                  ? `${Math.round(item.estimated_calories)} kcal`
                  : ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {meal.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{meal.notes}</Text>
        </View>
      ) : null}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.reanalyzeBtn}
          onPress={handleReanalyze}
          disabled={reanalyzing}
        >
          {reanalyzing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.reanalyzeBtnText}>Re-analyze</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Text style={styles.deleteBtnText}>Delete Meal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function MacroItem({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View style={macroItemStyles.container}>
      <Text style={[macroItemStyles.value, { color }]}>
        {value}
        <Text style={macroItemStyles.unit}> {unit}</Text>
      </Text>
      <Text style={macroItemStyles.label}>{label}</Text>
    </View>
  );
}

const macroItemStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    minWidth: 60,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
  unit: {
    fontSize: 12,
    fontWeight: "400",
  },
  label: {
    fontSize: 11,
    color: "#9E9E9E",
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  errorText: {
    fontSize: 16,
    color: "#9E9E9E",
  },
  image: {
    width: "100%",
    height: 280,
  },
  placeholderImage: {
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#9E9E9E",
    fontSize: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  dateTime: {
    fontSize: 14,
    color: "#757575",
  },
  macroCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  macroGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 12,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  foodItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  foodItemName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  foodItemCal: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "600",
  },
  notesText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  reanalyzeBtn: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  reanalyzeBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F44336",
  },
  deleteBtnText: {
    color: "#F44336",
    fontSize: 15,
    fontWeight: "700",
  },
});
