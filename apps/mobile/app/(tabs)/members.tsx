import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { MemberStatus } from "@coalita/db";

const mockMembers = [
  {
    id: "1",
    membership_number: "M-0001",
    first_name: "Anna",
    last_name: "Müller",
    email: "anna.mueller@example.com",
    status: MemberStatus.active,
  },
  {
    id: "2",
    membership_number: "M-0002",
    first_name: "Thomas",
    last_name: "Becker",
    email: "thomas.becker@example.com",
    status: MemberStatus.passive,
  },
  {
    id: "3",
    membership_number: "M-0003",
    first_name: "Maria",
    last_name: "Schmidt",
    email: "maria.schmidt@example.com",
    status: MemberStatus.honorary,
  },
];

const statusColors: Record<MemberStatus, { bg: string; text: string; label: string }> = {
  [MemberStatus.active]: { bg: "#dcfce7", text: "#166534", label: "Aktiv" },
  [MemberStatus.passive]: { bg: "#fef9c3", text: "#854d0e", label: "Passiv" },
  [MemberStatus.honorary]: { bg: "#dbeafe", text: "#1e40af", label: "Ehrenmitglied" },
  [MemberStatus.resigned]: { bg: "#f3f4f6", text: "#4b5563", label: "Ausgetreten" },
};

type Member = typeof mockMembers[number];

function MemberCard({ item }: { item: Member }) {
  const status = statusColors[item.status];
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.first_name[0]}{item.last_name[0]}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.memberNumber}>{item.membership_number}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MembersScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemberCard item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  list: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  email: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 1,
  },
  memberNumber: {
    fontSize: 12,
    color: "#9ca3af",
    fontFamily: "monospace",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
