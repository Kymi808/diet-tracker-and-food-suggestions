import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{label}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#FAFAFA" },
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#9E9E9E",
        tabBarStyle: { paddingBottom: 4, height: 56 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon label={"\u{1F3E0}"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ focused }) => (
            <TabIcon label={"\u{1F4F7}"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused }) => (
            <TabIcon label={"\u{1F4CB}"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="suggestions"
        options={{
          title: "Suggestions",
          tabBarIcon: ({ focused }) => (
            <TabIcon label={"\u{1F4A1}"} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
