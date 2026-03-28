import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const initialCustomers = [
  { id: "1", name: "Waleed Hassan", defaultLtr: 3, ltr: 3, adj: 0, price: 630 },
  { id: "2", name: "Sana Bibi", defaultLtr: 5, ltr: 7, adj: 0, price: 1470 },
  { id: "3", name: "Uncle Tariq", defaultLtr: 2, ltr: 0, adj: 0, price: 0 },
  { id: "4", name: "Fatima Apa", defaultLtr: 3, ltr: 3, adj: 1, price: 840 }, // (3+1)*210 = 840
];

export default function EntryScreen() {
  const [date, setDate] = useState("25/03/2026");
  const [route, setRoute] = useState("Route A — Johar Town");
  const [customers, setCustomers] = useState(initialCustomers);
  const dailyRate = 210;

  const totalLtr = customers.reduce((sum, c) => sum + (c.ltr + c.adj), 0);
  const totalAmount = customers.reduce((sum, c) => sum + (c.price), 0);

  const updateLtr = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const newPrice = (num + c.adj) * dailyRate;
        return { ...c, ltr: num, price: newPrice };
      }
      return c;
    }));
  };

  const updateAdj = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const newPrice = (c.ltr + num) * dailyRate;
        return { ...c, adj: num, price: newPrice };
      }
      return c;
    }));
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>Daily Entry</ThemedText>
          </View>
          <Pressable style={styles.datePicker}>
            <ThemedText style={styles.dateText}>{date}</ThemedText>
            <Ionicons name="calendar-outline" size={18} color="#6b7280" />
          </Pressable>
        </View>

        <View style={styles.headerSubRow}>
          <ThemedText style={styles.urduTitle}>روزانہ اندراج</ThemedText>
        </View>

        <Pressable style={styles.routeSelector}>
          <ThemedText style={styles.routeText}>{route}</ThemedText>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </Pressable>

        <ThemedView style={styles.rateInfoBox}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cash-outline" size={20} color="#2563eb" />
            <ThemedText style={styles.rateTextMain}>
              Rate: <ThemedText style={{ fontWeight: "800" }}>{dailyRate}</ThemedText> / Liter today
            </ThemedText>
          </View>
          <ThemedText style={styles.urduRateText}>آج کا ریٹ</ThemedText>
        </ThemedView>

        <View style={styles.tableHeader}>
          <ThemedText style={[styles.colLabel, { flex: 2 }]}>CUSTOMER</ThemedText>
          <ThemedText style={[styles.colLabel, { width: 50, textAlign: "center" }]}>LTR</ThemedText>
          <ThemedText style={[styles.colLabel, { width: 50, textAlign: "center" }]}>+/- L</ThemedText>
          <ThemedText style={[styles.colLabel, { width: 70, textAlign: "right" }]}>Rs</ThemedText>
        </View>

        {customers.map((c) => (
          <View key={c.id} style={styles.entryRow}>
            <View style={{ flex: 2 }}>
              <ThemedText style={styles.customerName}>{c.name}</ThemedText>
              <ThemedText style={styles.defaultInfo}>default {c.defaultLtr}L</ThemedText>
            </View>
            
            <TextInput
              value={c.ltr.toString()}
              onChangeText={(v) => updateLtr(c.id, v)}
              keyboardType="numeric"
              style={styles.ltrInput}
            />

            <TextInput
              value={c.adj.toString()}
              onChangeText={(v) => updateAdj(c.id, v)}
              keyboardType="numeric"
              style={styles.adjInput}
            />

            <View style={{ width: 70 }}>
              <ThemedText style={[styles.priceText, { color: c.price > 0 ? "#059669" : "#9ca3af" }]}>
                {c.price > 0 ? `Rs ${c.price.toLocaleString()}` : "--"}
              </ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Sticky Footer */}
      <ThemedView style={styles.footer}>
        <View style={styles.summaryInfo}>
          <ThemedText style={styles.totalLtr}>
            <ThemedText style={{ fontWeight: "800" }}>{totalLtr}L</ThemedText> total
          </ThemedText>
          <ThemedText style={styles.totalAmount}>
            Rs {totalAmount.toLocaleString()}
          </ThemedText>
        </View>
        <Pressable style={styles.saveAllButton}>
          <ThemedText style={styles.saveAllText}>Save all ✓</ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  containerContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100, // extra space for footer
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  headerSubRow: {
    marginTop: 4,
    marginBottom: 16,
    marginLeft: 40,
  },
  urduTitle: {
    fontSize: 18,
    color: "#6b7280",
  },
  routeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  routeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  rateInfoBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rateTextMain: {
    fontSize: 15,
    color: "#1e40af",
    fontWeight: "600",
  },
  urduRateText: {
    fontSize: 15,
    color: "#1e40af",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    marginBottom: 12,
  },
  colLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9ca3af",
    letterSpacing: 0.5,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  defaultInfo: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  ltrInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginRight: 10,
  },
  adjInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginRight: 10,
    backgroundColor: "#f9fafb",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  totalLtr: {
    fontSize: 16,
    color: "#374151",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#059669",
  },
  saveAllButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveAllText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
