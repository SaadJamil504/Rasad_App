import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../constants/Api";

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"details" | "ledger">("ledger");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data states
  const [customer, setCustomer] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ledgerItems, setLedgerItems] = useState<any[]>([]);

  // Edit states
  const [editName, setEditName] = useState("");
  const [editHouse, setEditHouse] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editCity, setEditCity] = useState("Peshawar");
  const [editQty, setEditQty] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editMilk, setEditMilk] = useState("buffalo");

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      };

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Parallel fetching per network log specifications
      const [staffRes, delivRes, payRes] = await Promise.all([
        fetch(`${ENDPOINTS.CUSTOMERS}${id}/`, { headers }),
        fetch(`${ENDPOINTS.DELIVERIES.replace("daily/", "history/")}?month=${month}&year=${year}&customer_id=${id}`, { headers }),
        fetch(`${ENDPOINTS.PAYMENTS_LIST}?customer_id=${id}`, { headers })
      ]);

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setCustomer(staffData);
        // Pre-fill editable fields
        setEditName(staffData.first_name || staffData.full_name || staffData.username || "");
        setEditHouse(staffData.house_no || "");
        setEditStreet(staffData.street || "");
        setEditArea(staffData.area || "");
        setEditCity(staffData.city || "Peshawar");
        setEditQty(staffData.daily_quantity || "0");
        setEditRate(staffData.rate_per_liter || "0");
        setEditMilk(staffData.milk_type || "buffalo");
      }

      const delivData = delivRes.ok ? await delivRes.json() : [];
      const payData = payRes.ok ? await payRes.json() : [];

      const dList = Array.isArray(delivData) ? delivData : (delivData.results || []);
      const pList = Array.isArray(payData) ? payData : (payData.results || []);

      setDeliveries(dList);
      setPayments(pList);

      // Merge into a single ledger array sorted by date descending
      const combined = [
        ...dList.map((d: any) => ({ ...d, type: "delivery", sortDate: d.date || d.created_at })),
        ...pList.map((p: any) => ({ ...p, type: "payment", sortDate: p.date || p.created_at }))
      ];

      combined.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
      setLedgerItems(combined);

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not load customer data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDetails = async () => {
    setIsSaving(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const payload = {
        first_name: editName,
        house_no: editHouse,
        street: editStreet,
        area: editArea,
        city: editCity,
        daily_quantity: parseFloat(editQty || "0").toFixed(2),
        rate_per_liter: parseFloat(editRate || "0").toFixed(2),
        milk_type: editMilk
      };

      const response = await fetch(`${ENDPOINTS.CUSTOMERS}${id}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert("Saved", "Customer details updated successfully.");
        fetchCustomerData(); // Refresh details
      } else {
        const err = await response.json();
        Alert.alert("Error", JSON.stringify(err));
      }
    } catch (e) {
      Alert.alert("Error", "Network error updating details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !customer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  const renderLedgerItem = ({ item }: { item: any }) => {
    const isPay = item.type === "payment";
    const title = isPay ? `Payment Received (${item.method || "Cash"})` : `Delivery (${item.milk_type || customer.milk_type || "Milk"})`;
    const amountStr = isPay ? `+ Rs ${item.amount}` : `- Rs ${parseFloat(item.total_price || 0).toLocaleString()}`;
    const amountColor = isPay ? "#10b981" : "#ef4444";
    const dateStr = item.date ? new Date(item.date).toLocaleDateString() : "Just Now";

    return (
      <ThemedView style={styles.ledgerCard}>
        <View style={styles.ledgerIconContainer}>
          <Ionicons name={isPay ? "cash" : "water"} size={22} color={amountColor} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.ledgerTitle}>{title}</ThemedText>
          <ThemedText style={styles.ledgerSub}>
             {dateStr} {isPay ? "" : `• ${item.delivered_quantity || 0}L`}
          </ThemedText>
        </View>
        <ThemedText style={[styles.ledgerAmount, { color: amountColor }]}>{amountStr}</ThemedText>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>{customer.first_name || customer.username}</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.profileSummary}>
         <View style={styles.avatarCircle}>
             <ThemedText style={styles.avatarText}>
                {(customer.first_name || customer.username || "U").charAt(0).toUpperCase()}
             </ThemedText>
         </View>
         <ThemedText style={styles.profileName}>{customer.first_name || customer.username}</ThemedText>
         <ThemedText style={styles.profileSub}>
             Outstanding: Rs {parseFloat(customer.outstanding_balance || 0).toLocaleString()}
         </ThemedText>
      </View>

      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === "ledger" && styles.activeTab]}
          onPress={() => setActiveTab("ledger")}
        >
          <ThemedText style={[styles.tabText, activeTab === "ledger" && styles.activeTabText]}>Ledger & History</ThemedText>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === "details" && styles.activeTab]}
          onPress={() => setActiveTab("details")}
        >
          <ThemedText style={[styles.tabText, activeTab === "details" && styles.activeTabText]}>Edit Details</ThemedText>
        </Pressable>
      </View>

      {activeTab === "ledger" ? (
        <FlatList
          data={ledgerItems}
          keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
          renderItem={renderLedgerItem}
          contentContainerStyle={styles.listContent}
          style={{ flex: 1 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="book-outline" size={48} color="#d1d5db" />
              <ThemedText style={{ color: "#9ca3af", marginTop: 10 }}>No history for this month</ThemedText>
            </View>
          }
        />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
          <ThemedView style={styles.formCard}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>FULL NAME</ThemedText>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <ThemedText style={styles.label}>HOUSE NO #</ThemedText>
                <TextInput style={styles.input} value={editHouse} onChangeText={setEditHouse} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>STREET</ThemedText>
                <TextInput style={styles.input} value={editStreet} onChangeText={setEditStreet} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <ThemedText style={styles.label}>AREA</ThemedText>
                <TextInput style={styles.input} value={editArea} onChangeText={setEditArea} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>CITY</ThemedText>
                <TextInput style={styles.input} value={editCity} onChangeText={setEditCity} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                 <ThemedText style={styles.label}>MILK TYPE</ThemedText>
                 <View style={{ flexDirection: "row", gap: 5 }}>
                    <Pressable style={[styles.milkBtn, editMilk === "buffalo" && styles.milkBtnActive]} onPress={() => setEditMilk("buffalo")}>
                       <ThemedText style={[styles.milkBtnText, editMilk === "buffalo" && styles.milkBtnTextActive]}>Buffalo</ThemedText>
                    </Pressable>
                    <Pressable style={[styles.milkBtn, editMilk === "cow" && styles.milkBtnActive]} onPress={() => setEditMilk("cow")}>
                       <ThemedText style={[styles.milkBtnText, editMilk === "cow" && styles.milkBtnTextActive]}>Cow</ThemedText>
                    </Pressable>
                 </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>DAILY QTY (L)</ThemedText>
                <TextInput style={styles.input} value={editQty} onChangeText={setEditQty} keyboardType="numeric" />
              </View>
            </View>

            <Pressable 
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
              onPress={handleUpdateDetails}
              disabled={isSaving}
            >
              <ThemedText style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save Details"}</ThemedText>
            </Pressable>
          </ThemedView>
        </ScrollView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
  backBtn: { backgroundColor: "#f1f5f9", padding: 8, borderRadius: 10 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  profileSummary: { alignItems: "center", marginBottom: 20 },
  avatarCircle: { width: 70, height: 70, borderRadius: 25, backgroundColor: "#dbeafe", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  avatarText: { fontSize: 28, fontWeight: "900", color: "#2563eb" },
  profileName: { fontSize: 22, fontWeight: "900", color: "#1e293b" },
  profileSub: { fontSize: 14, fontWeight: "700", color: "#ef4444", marginTop: 4 },
  tabContainer: { flexDirection: "row", marginHorizontal: 20, backgroundColor: "#f1f5f9", borderRadius: 15, padding: 4, marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
  activeTab: { backgroundColor: "#fff", elevation: 1 },
  tabText: { fontSize: 13, color: "#64748b", fontWeight: "700" },
  activeTabText: { color: "#111827" },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  ledgerCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  ledgerIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center", marginRight: 15 },
  ledgerTitle: { fontSize: 15, fontWeight: "800", color: "#1e293b" },
  ledgerSub: { fontSize: 12, color: "#94a3b8", marginTop: 2, fontWeight: "600" },
  ledgerAmount: { fontSize: 16, fontWeight: "900" },
  formCard: { backgroundColor: "#fff", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: "900", color: "#94a3b8", marginBottom: 6, letterSpacing: 1 },
  input: { backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", paddingVertical: 14, paddingHorizontal: 14, fontSize: 15, fontWeight: "600", color: "#1e293b" },
  row: { flexDirection: "row" },
  milkBtn: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  milkBtnActive: { backgroundColor: "#111827", borderColor: "#111827" },
  milkBtnText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  milkBtnTextActive: { color: "#fff" },
  saveBtn: { backgroundColor: "#065f46", paddingVertical: 16, alignItems: "center", borderRadius: 16, marginTop: 10 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
