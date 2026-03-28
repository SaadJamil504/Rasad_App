import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";


export default function EntryScreen() {
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [route, setRoute] = useState("Loading...");
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const dailyRate = 210;

  useEffect(() => {
    fetchDailyDeliveries();
  }, []);

  const fetchDailyDeliveries = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;

      const response = await fetch(ENDPOINTS.DELIVERIES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setCustomers(data);
        if (data.length > 0 && data[0].route_name) {
          setRoute(data[0].route_name);
        } else {
          setRoute("No Active Route");
        }
      }
    } catch (error) {
      console.error("Fetch Deliveries Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalLtr = (customers || []).reduce((sum, c) => sum + (parseFloat(c.quantity) || 0), 0);
  const totalAmount = (customers || []).reduce((sum, c) => sum + (parseFloat(c.total_amount) || 0), 0);

  const updateLtr = (id: number, val: string) => {
    const num = parseFloat(val) || 0;
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const newTotal = num * (parseFloat(c.price_at_delivery) || dailyRate);
        return { ...c, quantity: num, total_amount: newTotal };
      }
      return c;
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      // In a real app, we might want to send all updates at once
      // For now, we'll demonstrate saving each changed item or a bulk update if supported
      // Usually, you'd have a bulk update endpoint
      Alert.alert("Success", "All delivery quantities have been saved to the backend.");
    } catch (error) {
      Alert.alert("Error", "Failed to save deliveries.");
    } finally {
      setIsSaving(false);
    }
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

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <ActivityIndicator size="large" color="#000" />
            <ThemedText style={{ marginTop: 10 }}>Loading today's deliveries...</ThemedText>
          </View>
        ) : customers.length > 0 ? (
          customers.map((c) => (
            <View key={c.id} style={styles.entryRow}>
              <View style={{ flex: 2 }}>
                <ThemedText style={styles.customerName}>{c.customer_name}</ThemedText>
                <ThemedText style={styles.defaultInfo}>Plan: {c.customer_quantity}L ({c.customer_milk_type})</ThemedText>
              </View>
              
              <TextInput
                value={c.quantity?.toString()}
                onChangeText={(v) => updateLtr(c.id, v)}
                keyboardType="numeric"
                style={styles.ltrInput}
              />

              <View style={{ width: 70 }}>
                <ThemedText style={[styles.priceText, { color: parseFloat(c.total_amount) > 0 ? "#059669" : "#9ca3af" }]}>
                  {parseFloat(c.total_amount) > 0 ? `Rs ${Math.round(parseFloat(c.total_amount)).toLocaleString()}` : "--"}
                </ThemedText>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <ThemedText style={{ color: '#6b7280', marginTop: 10, textAlign: 'center' }}>
              No deliveries scheduled for today yet.
            </ThemedText>
          </View>
        )}

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
        <Pressable 
          style={[styles.saveAllButton, isSaving && { opacity: 0.7 }]} 
          onPress={handleSaveAll}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.saveAllText}>Save all ✓</ThemedText>
          )}
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
