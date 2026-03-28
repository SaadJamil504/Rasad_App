import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const stats = [
  {
    key: "deliveries",
    title: "Today's Deliveries",
    value: "2",
    detail: "0 done 2 pending",
    accent: "#10b981",
    border: "#22c55e",
  },
  {
    key: "revenue",
    title: "Today's Revenue",
    value: "Rs 0",
    detail: "100.0% vs yesterday",
    accent: "#f97316",
    border: "#fb923c",
  },
  {
    key: "overdue",
    title: "Overdue Payments",
    value: "2",
    detail: "Rs 3,300 total due",
    accent: "#ef4444",
    border: "#fca5a5",
  },
  {
    key: "active",
    title: "Active Customers",
    value: "2",
    detail: "0 paused today",
    accent: "#6366f1",
    border: "#8b5cf6",
  },
];

const overdueItems = [
  {
    id: "#492",
    name: "Waleed Hassan",
    days: "12 days",
    amount: "Rs8,400",
    color: "#e11d48",
  },
  {
    id: "#387",
    name: "Sana Bibi",
    days: "8 days",
    amount: "Rs3,150",
    color: "#e11d48",
  },
  {
    id: "#581",
    name: "Uncle Tariq",
    days: "3 days",
    amount: "Rs1,890",
    color: "#f59e0b",
  },
];

export default function HomeScreen() {
  const cardWidth = "48%";
  const router = useRouter();
  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <ThemedView style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <ThemedText style={styles.topTitle}>
            Dashboard
          </ThemedText>
        </View>
      </ThemedView>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <ThemedView
            key={item.key}
            style={[
              styles.statCard,
              { borderColor: item.border, width: cardWidth },
            ]}
          >
            <ThemedText style={[styles.statTitle, { color: item.accent }]}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.statValue}>{item.value}</ThemedText>
            <ThemedText style={styles.statDetail}>{item.detail}</ThemedText>
          </ThemedView>
        ))}
      </View>

      <ThemedView style={styles.overdueCard}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ThemedText style={styles.overdueTitle}>Overdue Alerts</ThemedText>
          <Pressable>
            <ThemedText
              style={{ color: "#3b82f6", fontWeight: "600", fontSize: 13 }}
            >
              View All
            </ThemedText>
          </Pressable>
        </View>

        {overdueItems.map((item) => (
          <ThemedView key={item.id} style={styles.overdueAlertCard}>
            <View style={styles.overdueAlertInfo}>
              <ThemedText style={styles.overdueName}>{item.name}</ThemedText>
              <ThemedText style={{ color: item.color, fontWeight: "700" }}>
                {item.amount}
              </ThemedText>
            </View>
            <ThemedText style={styles.overdueText}>
              {item.days} • N/A, Morning
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIcon: {
    fontSize: 18,
    color: "#111827",
  },
  topTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "600",
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  profileBadge: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1d4ed8",
  },
  profileInitial: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
    width: "48%",
    minWidth: 140,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statTitle: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 2,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 26,
    color: "#111827",
    fontWeight: "700",
    marginVertical: 4,
  },
  statDetail: {
    fontSize: 12,
    color: "#6b7280",
  },
  overdueTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },
  overdueAlertCard: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  overdueAlertInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  overdueName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b91c1c",
  },
  overdueText: {
    fontSize: 14,
    color: "#6b7280",
  },
  pausedCard: {
    borderRadius: 14,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderWidth: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    alignItems: "center",
  },
  pausedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  pausedDesc: {
    color: "#6b7280",
    textAlign: "center",
  },
  overdueCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  overdueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  overdueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  overdueInfo: {
    flex: 1,
    flexDirection: "column",
  },
  smallText: {
    color: "#6b7280",
    fontSize: 13,
  },
  amountText: {
    fontWeight: "700",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeIcon: {
    fontSize: 24,
    color: "#6b7280",
  },
  menuList: {
    padding: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuText: {
    fontSize: 18,
    color: "#111827",
  },
  drawerItemText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
});
