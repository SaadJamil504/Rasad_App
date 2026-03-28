import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CustomerHome() {
  const router = useRouter();

  const history = [
    { day: "Today", liters: "5L", amount: "Rs 1,050" },
    { day: "Yesterday", liters: "5L", amount: "Rs 1,050" },
    { day: "Mon", liters: "7L", amount: "Rs 1,470" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.urduWelcome}>السلام علیکم</Text>
            <Text style={styles.welcomeName}>Sana Bibi</Text>
            <TouchableOpacity style={styles.businessLink}>
              <Text style={styles.businessName}>Ahmed Doodh Wala</Text>
              <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.urduBalance}>آپ کا بقایا</Text>
          <Text style={styles.balanceLabel}>Your balance</Text>
          <Text style={styles.balanceAmount}>Rs 0</Text>
          <View style={styles.balanceStatus}>
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
            <Text style={styles.statusText}>All clear this month</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/(customer)/pause")}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="pause" size={24} color="#2563eb" />
            </View>
            <Text style={styles.actionLabel}>Pause</Text>
            <Text style={styles.actionUrdu}>روکیں</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/(customer)/quantity")}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="list" size={24} color="#16a34a" />
            </View>
            <Text style={styles.actionLabel}>Quantity</Text>
            <Text style={styles.actionUrdu}>مقدار</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#faf5ff' }]}>
              <Ionicons name="receipt" size={24} color="#9333ea" />
            </View>
            <Text style={styles.actionLabel}>My Bill</Text>
            <Text style={styles.actionUrdu}>میرا بل</Text>
          </TouchableOpacity>
        </View>

        {/* Today Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY</Text>
          <Text style={styles.urduSectionTitle}>آج</Text>
        </View>
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryInfo}>
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={16} color="#22c55e" />
            </View>
            <View>
              <Text style={styles.deliveryText}>Delivered at 5:42 AM</Text>
              <Text style={styles.urduDeliveryTime}>صبح ۵:۴۲ بجے ڈیلیور ہوا</Text>
            </View>
          </View>
          <Text style={styles.deliveryLiters}>5L</Text>
        </View>

        {/* Weekly History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>THIS WEEK</Text>
          <Text style={styles.urduSectionTitle}>اس ہفتے</Text>
        </View>
        <View style={styles.historyTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.columnLabel}>DAY</Text>
            <Text style={styles.columnLabel}>LITERS</Text>
            <Text style={[styles.columnLabel, { textAlign: 'right' }]}>AMOUNT</Text>
          </View>
          {history.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cellDay}>{item.day}</Text>
              <Text style={styles.cellLiters}>{item.liters}</Text>
              <Text style={styles.cellAmount}>{item.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  urduWelcome: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
  },
  businessLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  businessName: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  profileButton: {
    padding: 4,
  },
  balanceCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  urduBalance: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "left",
  },
  balanceLabel: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "800",
    marginBottom: 12,
  },
  balanceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
  actionUrdu: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9ca3af",
    letterSpacing: 1,
  },
  urduSectionTitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  deliveryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 24,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  urduDeliveryTime: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  deliveryLiters: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  historyTable: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    padding: 16,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    marginBottom: 12,
  },
  columnLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9ca3af",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  cellDay: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  cellLiters: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  cellAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    textAlign: "right",
    flex: 1,
  },
});
