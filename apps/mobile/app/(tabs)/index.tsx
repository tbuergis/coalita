import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>C</Text>
        </View>
      </View>
      <Text style={styles.title}>Willkommen bei Coalita</Text>
      <Text style={styles.subtitle}>Vereinsverwaltung für moderne Clubs</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Schnellübersicht</Text>
        <Text style={styles.cardText}>Navigiere zu Mitglieder, um alle Vereinsmitglieder zu sehen.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    padding: 24,
    paddingTop: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "bold",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
