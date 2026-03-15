import React from "react";
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
import { useSuggestions } from "../../hooks/useSuggestions";
import { useDailySummary } from "../../hooks/useDailySummary";
import { FoodSuggestion } from "../../types";

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export default function SuggestionsScreen() {
  const today = todayString();
  const suggestionsQuery = useSuggestions(today);
  const summaryQuery = useDailySummary(today);

  const data = suggestionsQuery.data;
  const summary = summaryQuery.data;

  function onRefresh() {
    suggestionsQuery.refetch();
    summaryQuery.refetch();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={suggestionsQuery.isFetching || summaryQuery.isFetching}
            onRefresh={onRefresh}
          />
        }
      >
        <Text style={styles.title}>Food Suggestions</Text>

        {/* Current intake summary */}
        {summary && (
          <View style={styles.intakeCard}>
            <Text style={styles.intakeTitle}>Today's Intake</Text>
            <View style={styles.intakeRow}>
              <Text style={styles.intakeItem}>
                {Math.round(summary.total_calories)} kcal
              </Text>
              <Text style={styles.intakeItem}>
                {Math.round(summary.total_protein_g)}g protein
              </Text>
              <Text style={styles.intakeItem}>
                {Math.round(summary.total_carbs_g)}g carbs
              </Text>
              <Text style={styles.intakeItem}>
                {Math.round(summary.total_fat_g)}g fat
              </Text>
            </View>
          </View>
        )}

        {/* Remaining macros */}
        {data && (
          <View style={styles.remainingCard}>
            <Text style={styles.remainingTitle}>Remaining Today</Text>
            <View style={styles.intakeRow}>
              <Text style={styles.remainingItem}>
                {Math.round(data.remaining_calories)} kcal
              </Text>
              <Text style={styles.remainingItem}>
                {Math.round(data.remaining_protein)}g protein
              </Text>
              <Text style={styles.remainingItem}>
                {Math.round(data.remaining_carbs)}g carbs
              </Text>
              <Text style={styles.remainingItem}>
                {Math.round(data.remaining_fat)}g fat
              </Text>
            </View>
          </View>
        )}

        {/* Refresh button */}
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={suggestionsQuery.isFetching}
        >
          <Text style={styles.refreshBtnText}>
            {suggestionsQuery.isFetching ? "Refreshing..." : "Get New Suggestions"}
          </Text>
        </TouchableOpacity>

        {/* Suggestions list */}
        {suggestionsQuery.isLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : data && data.suggestions.length > 0 ? (
          data.suggestions.map((suggestion, index) => (
            <SuggestionCard key={index} suggestion={suggestion} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No suggestions available. Log some meals first, then come back for
              personalized recommendations!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SuggestionCard({ suggestion }: { suggestion: FoodSuggestion }) {
  return (
    <View style={styles.suggestionCard}>
      <Text style={styles.suggestionName}>{suggestion.name}</Text>
      <Text style={styles.suggestionDesc}>{suggestion.description}</Text>
      <View style={styles.suggestionMeta}>
        <Text style={styles.metaItem}>
          {Math.round(suggestion.estimated_calories)} kcal
        </Text>
        <Text style={styles.metaItem}>
          {Math.round(suggestion.estimated_protein)}g protein
        </Text>
      </View>
      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Why this?</Text>
        <Text style={styles.reasonText}>{suggestion.reason}</Text>
      </View>
    </View>
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
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  intakeCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  intakeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
    marginBottom: 8,
  },
  intakeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  intakeItem: {
    fontSize: 13,
    color: "#333",
    backgroundColor: "#F5F5F5",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    overflow: "hidden",
  },
  remainingCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  remainingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
  },
  remainingItem: {
    fontSize: 13,
    color: "#2E7D32",
    backgroundColor: "#C8E6C9",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    overflow: "hidden",
  },
  refreshBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  refreshBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
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
  suggestionCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  suggestionDesc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  suggestionMeta: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },
  reasonContainer: {
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    padding: 10,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F57F17",
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 12,
    color: "#555",
  },
});
