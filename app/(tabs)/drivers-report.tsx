import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { ENDPOINTS } from "../../constants/Api";
import { ThemedText } from "@/components/themed-text";

interface Report {
  id: number;
  driver_name: string;
  date: string;
  total_milk: string;
  total_cash: string;
  customers_served: number;
  note?: string;
}

export default function DriversReportScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await fetch(ENDPOINTS.DAILY_REPORTS as string, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setReports(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (e) {
      console.error("Error fetching reports:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View>
          <ThemedText style={styles.driverName}>{item.driver_name || "Unknown Driver"}</ThemedText>
          <ThemedText style={styles.reportDate}>{new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</ThemedText>
        </View>
        <View style={styles.statusBadge}>
          <ThemedText style={styles.statusText}>SUBMITTED</ThemedText>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.iconBg, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="water" size={16} color="#2563eb" />
          </View>
          <View>
            <ThemedText style={styles.statLabel}>MILK</ThemedText>
            <ThemedText style={styles.statValue}>{item.total_milk}L</ThemedText>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconBg, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="cash" size={16} color="#16a34a" />
          </View>
          <View>
            <ThemedText style={styles.statLabel}>CASH</ThemedText>
            <ThemedText style={styles.statValue}>Rs {parseFloat(item.total_cash).toLocaleString()}</ThemedText>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.iconBg, { backgroundColor: '#faf5ff' }]}>
            <Ionicons name="people" size={16} color="#9333ea" />
          </View>
          <View>
            <ThemedText style={styles.statLabel}>STOPS</ThemedText>
            <ThemedText style={styles.statValue}>{item.customers_served}</ThemedText>
          </View>
        </View>
      </View>

      {item.note && (
        <View style={styles.noteSection}>
          <Ionicons name="information-circle-outline" size={14} color="#64748b" style={{ marginRight: 6 }} />
          <ThemedText style={styles.noteText}>{item.note}</ThemedText>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Reports</ThemedText>
          <ThemedText style={styles.subtitle}>ڈرائیور رپورٹ</ThemedText>
        </View>
      </View>

      {isLoading && reports.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchReports} colors={["#0f172a"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
              <ThemedText style={styles.emptyTitle}>No reports yet</ThemedText>
              <ThemedText style={styles.emptySubtitle}>Driver submissions will appear here.</ThemedText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000",
  },
  subtitle: {
    fontSize: 20,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  reportDate: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#16a34a",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statItem: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 2,
  },
  noteSection: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fefce8",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fef9c3",
  },
  noteText: {
    fontSize: 12,
    color: "#854d0e",
    fontWeight: "600",
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
    fontWeight: "600",
  },
});
