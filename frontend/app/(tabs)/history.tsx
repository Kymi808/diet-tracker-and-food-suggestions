import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MealCard from "../../components/MealCard";
import { useMeals } from "../../hooks/useMeals";
import { useDailySummary } from "../../hooks/useDailySummary";

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function HistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(todayString);

  const mealsQuery = useMeals(selectedDate);
  const summaryQuery = useDailySummary(selectedDate);

  const meals = mealsQuery.data;
  const summary = summaryQuery.data;

  const isToday = selectedDate === todayString();

  function onRefresh() {
    mealsQuery.refetch();
    summaryQuery.refetch();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Date selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity
          style={styles.dateArrow}
          onPress={() => setSelectedDate(addDays(selectedDate, -1))}
        >
          <Text style={styles.dateArrowText}>{"\u25C0"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedDate(todayString())}
          style={styles.dateCenter}
        >
          <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
          {!isToday && <Text style={styles.todayHint}>Tap for today</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dateArrow, isToday && styles.dateArrowDisabled]}
          onPress={() => {
            if (!isToday) setSelectedDate(addDays(selectedDate, 1));
          }}
          disabled={isToday}
        >
          <Text
            style={[
              styles.dateArrowText,
              isToday && styles.dateArrowTextDisabled,
            ]}
          >
            {"\u25B6"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={mealsQuery.isFetching || summaryQuery.isFetching}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Daily summary */}
        {summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Daily Totals</Text>
            <View style={styles.summaryRow}>
              <SummaryItem label="Calories" value={`${Math.round(summary.total_calories)}`} />
              <SummaryItem label="Protein" value={`${Math.round(summary.total_protein_g)}g`} />
              <SummaryItem label="Carbs" value={`${Math.round(summary.total_carbs_g)}g`} />
              <SummaryItem label="Fat" value={`${Math.round(summary.total_fat_g)}g`} />
            </View>
            <Text style={styles.mealCount}>
              {summary.meal_count} meal{summary.meal_count !== 1 ? "s" : ""} logged
            </Text>
          </View>
        )}

        {/* Meal list */}
        {mealsQuery.isLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : meals && meals.length > 0 ? (
          meals.map((meal) => <MealCard key={meal.id} meal={meal} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No meals logged for this day.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  dateArrow: {
    padding: 8,
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  dateArrowText: {
    fontSize: 18,
    color: "#4CAF50",
  },
  dateArrowTextDisabled: {
    color: "#BDBDBD",
  },
  dateCenter: {
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  todayHint: {
    fontSize: 11,
    color: "#4CAF50",
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  summaryCard: {
    margin: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 2,
  },
  mealCount: {
    textAlign: "center",
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 12,
  },
  loader: {
    marginTop: 32,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
  },
});
