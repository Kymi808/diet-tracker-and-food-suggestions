import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalorieProgressRing from "../../components/CalorieProgressRing";
import MacroBar from "../../components/MacroBar";
import MealCard from "../../components/MealCard";
import { useMeals } from "../../hooks/useMeals";
import { useDailySummary, useGoals } from "../../hooks/useDailySummary";

function todayString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function HomeScreen() {
  const today = todayString();
  const mealsQuery = useMeals(today);
  const summaryQuery = useDailySummary(today);
  const goalsQuery = useGoals();

  const refreshing =
    mealsQuery.isFetching || summaryQuery.isFetching || goalsQuery.isFetching;

  function onRefresh() {
    mealsQuery.refetch();
    summaryQuery.refetch();
    goalsQuery.refetch();
  }

  const summary = summaryQuery.data;
  const goals = goalsQuery.data;
  const meals = mealsQuery.data;

  const caloriesConsumed = summary?.total_calories ?? 0;
  const calorieGoal = goals?.calorie_goal ?? 2000;
  const proteinCurrent = summary?.total_protein_g ?? 0;
  const proteinGoal = goals?.protein_goal ?? 150;
  const carbsCurrent = summary?.total_carbs_g ?? 0;
  const carbsGoal = goals?.carbs_goal ?? 250;
  const fatCurrent = summary?.total_fat_g ?? 0;
  const fatGoal = goals?.fat_goal ?? 65;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date header */}
        <Text style={styles.dateText}>{formatDisplayDate(today)}</Text>

        {/* Calorie ring */}
        <View style={styles.ringContainer}>
          <CalorieProgressRing consumed={caloriesConsumed} goal={calorieGoal} />
        </View>

        {/* Macro bars */}
        <View style={styles.macroSection}>
          <MacroBar
            label="Protein"
            current={proteinCurrent}
            goal={proteinGoal}
            color="#4CAF50"
          />
          <MacroBar
            label="Carbs"
            current={carbsCurrent}
            goal={carbsGoal}
            color="#FF9800"
          />
          <MacroBar
            label="Fat"
            current={fatCurrent}
            goal={fatGoal}
            color="#F44336"
          />
        </View>

        {/* Today's Meals */}
        <Text style={styles.sectionTitle}>Today's Meals</Text>

        {mealsQuery.isLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : meals && meals.length > 0 ? (
          meals.map((meal) => <MealCard key={meal.id} meal={meal} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No meals logged yet today. Tap the Camera tab to add one!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  ringContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  macroSection: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  loader: {
    marginTop: 24,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
  },
});
