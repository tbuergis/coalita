import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#6b7280",
        headerStyle: { backgroundColor: "#1e3a5f" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Startseite",
          headerTitle: "Coalita",
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Mitglieder",
          headerTitle: "Mitglieder",
        }}
      />
    </Tabs>
  );
}
