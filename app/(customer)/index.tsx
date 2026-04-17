import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";
import { useLanguage } from "../../contexts/LanguageContext";

export default function CustomerHome() {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomerData();
    setRefreshing(false);
  };

  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        router.replace("/login");
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const [profRes, statRes, histRes] = await Promise.all([
        fetch(ENDPOINTS.PROFILE, { headers }).catch(() => ({ ok: false, json: () => ({}) })),
        fetch(ENDPOINTS.DELIVERIES_STATUS, { headers }).catch(() => ({ ok: false, json: () => null })),
        fetch(ENDPOINTS.DELIVERIES_HISTORY, { headers }).catch(() => ({ ok: false, json: () => [] }))
      ]);

      const profData = profRes.ok ? await profRes.json() : {};
      const statData = statRes.ok ? await statRes.json() : null;
      const histData = histRes.ok ? await histRes.json() : [];

      setProfile(profData);
      setDeliveryStatus(statData);
      setHistory(Array.isArray(histData) ? histData : (histData.results || []));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.replace("/login");
  };

  if (isLoading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const bal = parseFloat(profile.outstanding_balance || 0);
  const isClear = bal <= 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.urduWelcome}>{t.assalamuAlaikum}</Text>
            <Text style={styles.welcomeName}>{profile.first_name || profile.full_name || profile.username || t.customers}</Text>
            <TouchableOpacity style={styles.businessLink}>
              <Text style={styles.businessName}>{profile.owner_dairy_name || "Assigned Dairy"}</Text>
              <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={toggleLanguage}
            >
              <Text style={styles.languageText}>{language === 'en' ? 'UR' : 'EN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={32} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.urduBalance}>{t.yourBalance}</Text>
          <Text style={styles.balanceLabel}>{t.yourBalance}</Text>
          <Text style={styles.balanceAmount}>Rs {bal.toLocaleString()}</Text>
          <View style={[styles.balanceStatus, isClear ? {} : { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
            <Ionicons name={isClear ? "checkmark-circle" : "alert-circle"} size={16} color={isClear ? "#22c55e" : "#ef4444"} />
            <Text style={[styles.statusText, isClear ? {} : { color: "#ef4444" }]}>
              {isClear ? t.allClear : t.paymentDue}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/(customer)/pause" as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="pause" size={24} color="#2563eb" />
            </View>
            <Text style={styles.actionLabel}>{t.pause}</Text>
            <Text style={styles.actionUrdu}>{t.pauseUrdu}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/(customer)/quantity" as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="list" size={24} color="#16a34a" />
            </View>
            <Text style={styles.actionLabel}>{t.quantity}</Text>
            <Text style={styles.actionUrdu}>{t.quantityUrdu}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/(customer)/bill" as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#faf5ff' }]}>
              <Ionicons name="receipt" size={24} color="#9333ea" />
            </View>
            <Text style={styles.actionLabel}>{t.myBill}</Text>
            <Text style={styles.actionUrdu}>{t.myBillUrdu}</Text>
          </TouchableOpacity>
        </View>

        {/* Today Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.todayCaps}</Text>
          <Text style={styles.urduSectionTitle}>{t.todayUrdu}</Text>
        </View>
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryInfo}>
            <View style={[styles.checkBadge, { backgroundColor: deliveryStatus?.status === 'delivered' ? "#f0fdf4" : (deliveryStatus?.status === 'paused' ? "#fef3c7" : "#eff6ff") }]}>
              <Ionicons 
                name={deliveryStatus?.status === 'delivered' ? "checkmark" : (deliveryStatus?.status === 'paused' ? "pause" : "time")} 
                size={16} 
                color={deliveryStatus?.status === 'delivered' ? "#22c55e" : (deliveryStatus?.status === 'paused' ? "#d97706" : "#3b82f6")} 
              />
            </View>
            <View>
              <Text style={styles.deliveryText}>
                {deliveryStatus?.status === 'delivered' 
                  ? t.deliveredAt(new Date(deliveryStatus.delivered_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
                  : (deliveryStatus?.status === 'paused' ? t.deliveryPaused : t.pendingDelivery)}
              </Text>
              <Text style={styles.urduDeliveryTime}>
                {deliveryStatus?.status === 'delivered' ? t.doneCaps : (deliveryStatus?.status === 'paused' ? t.pauseUrdu : t.pendingDelivery)}
              </Text>
            </View>
          </View>
          <Text style={styles.deliveryLiters}>{deliveryStatus?.quantity || profile.daily_quantity || 0}L</Text>
        </View>

        {/* Weekly History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.thisWeekCaps}</Text>
          <Text style={styles.urduSectionTitle}>{t.thisWeekUrdu}</Text>
        </View>
        <View style={styles.historyTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.columnLabel}>DATE</Text>
            <Text style={[styles.columnLabel, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
            <Text style={[styles.columnLabel, { flex: 1, textAlign: 'center' }]}>LITERS</Text>
            <Text style={[styles.columnLabel, { textAlign: 'right' }]}>AMOUNT</Text>
          </View>
          {history.length > 0 ? history.slice(0, 7).map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cellDay}>{item.date ? new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Unknown'}</Text>
              <Text style={[styles.cellLiters, { color: item.status === 'delivered' ? '#16a34a' : '#9ca3af', fontWeight: '500' }]}>{item.status}</Text>
              <Text style={styles.cellLiters}>{parseFloat(item.quantity || 0)}L</Text>
              <Text style={styles.cellAmount}>Rs {parseFloat(item.total_amount || 0)}</Text>
            </View>
          )) : (
            <Text style={{ textAlign: "center", padding: 20, color: "#9ca3af" }}>{t.noHistory}</Text>
          )}
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3b82f6',
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
