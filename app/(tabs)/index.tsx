import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any[]>([]);
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [userRole, setUserRole] = useState("owner");
  const cardWidth = "48%";
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        router.replace("/login");
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const profileRes = await fetch(ENDPOINTS.PROFILE, { headers });
      const profileData = profileRes.ok ? await profileRes.json() : {};
      const role = (profileData.role || 'owner').toLowerCase();
      setUserRole(role);

      // Rule: This index page is for OWNERS only. 
      // If someone else gets here, send them to their dashboard.
      if (role === 'customer') {
        router.replace("/(customer)");
        return;
      } else if (role === 'driver') {
        router.replace("/(driver)");
        return;
      }

      // Fetch Admin Stats
      const [statsRes, customersRes, paymentsRes] = await Promise.all([
        fetch(ENDPOINTS.DASHBOARD_STATS, { headers }),
        fetch(ENDPOINTS.CUSTOMERS_LIST, { headers }),
        fetch(ENDPOINTS.PAYMENTS_LIST, { headers })
      ]);

      const statsData = statsRes.ok ? await statsRes.json() : {};
      const customersData = customersRes.ok ? await customersRes.json() : [];
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];
      
      const customersList = Array.isArray(customersData) ? customersData : (customersData.results || []);
      const paymentsList = Array.isArray(paymentsData) ? paymentsData : (paymentsData.results || []);

      // Calculate overdue from customers list
      let totalOverdue = 0;
      let overdueCustomersCount = 0;
      let activeCustomersCount = customersList.length;
      const overdueArr: any[] = [];

      customersList.forEach((c: any) => {
        const balance = parseFloat(c.outstanding_balance || 0);
        if (balance > 0) {
          totalOverdue += balance;
          overdueCustomersCount++;
          overdueArr.push({
            id: c.id?.toString() || "#000",
            name: c.first_name || c.username || c.full_name || "Unknown",
            days: 'Overdue',
            amount: `Rs ${balance.toLocaleString()}`,
            color: "#ef4444",
            route: c.route_name || 'Unassigned'
          });
        }
      });

      // Calculate today's revenue from payments list
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysRevenue = paymentsList.reduce((sum: number, p: any) => {
        const pDate = p.created_at ? p.created_at.split('T')[0] : p.date;
        if (pDate === todayStr && p.status === 'confirmed') {
          return sum + parseFloat(p.amount || 0);
        }
        return sum;
      }, 0);


      const updatedStats = [
        {
          key: "deliveries",
          title: "Today's Deliveries",
          value: statsData.today_deliveries || "0",
          detail: `${statsData.delivered_count || 0} done ${statsData.pending_count || 0} pending`,
          accent: "#10b981",
          border: "#22c55e",
        },
        {
          key: "revenue",
          title: "Today's Collection",
          value: `Rs ${statsData.today_collection || statsData.today_revenue || todaysRevenue || 0}`,
          detail: `Recorded today`,
          accent: "#f97316",
          border: "#fb923c",
        },
        {
          key: "overdue",
          title: "Overdue Payments",
          value: `${overdueCustomersCount}`,
          detail: `Rs ${totalOverdue.toLocaleString()} total due`,
          accent: "#ef4444",
          border: "#fca5a5",
        },
        {
          key: "active",
          title: "Active Customers",
          value: `${activeCustomersCount}`,
          detail: `Total registered`,
          accent: "#6366f1",
          border: "#8b5cf6",
        },
      ];
      
      setDashboardStats(updatedStats);
      setOverdueItems(overdueArr);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.replace("/login");
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Dashboard</ThemedText>
          <ThemedText style={styles.subtitle}>اوور ویو</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#000"]} // Android
            tintColor="#000" // iOS
          />
        }
      >

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <ActivityIndicator size="large" color="#000" />
          <ThemedText style={{ marginTop: 10 }}>Loading dashboard...</ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            {(dashboardStats || []).map((item) => (
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

          {overdueItems.length > 0 ? (
            <ThemedView style={styles.overdueCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <ThemedText style={styles.overdueTitle}>
                   {userRole === 'customer' ? 'Recent History' : 'Overdue Alerts'}
                </ThemedText>
                <Pressable onPress={() => router.push("/(tabs)/customers")}>
                  <ThemedText
                    style={{ color: "#3b82f6", fontWeight: "700", fontSize: 13 }}
                  >
                    View All
                  </ThemedText>
                </Pressable>
              </View>

              {overdueItems.slice(0, 5).map((item) => (
                <ThemedView key={item.id} style={styles.overdueAlertCard}>
                  <View style={styles.overdueAlertInfo}>
                    <ThemedText style={styles.overdueName}>{item.name}</ThemedText>
                    <ThemedText style={{ color: item.color || "#e11d48", fontWeight: "800" }}>
                      {item.amount}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.overdueText}>
                    {userRole === 'customer' 
                      ? `${item.days} • ${item.route}` 
                      : `${item.days} • ${item.route || 'N/A'}, Morning`}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          ) : (
            <View style={styles.pausedCard}>
              <ThemedText style={styles.pausedTitle}>
                 {userRole === 'customer' ? 'No Recent Deliveries' : 'No Overdue Payments'}
              </ThemedText>
              <ThemedText style={styles.pausedDesc}>
                 {userRole === 'customer' ? 'Your history will appear here once confirmed.' : 'All your customers are up to date! Good job.'}
              </ThemedText>
            </View>
          )}
        </>
      )}

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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
    lineHeight: 42,
    paddingBottom: 6,
  },
  subtitle: {
    fontSize: 20,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 10,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    padding: 20,
    paddingTop: 16, // Reduced top padding
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: "uppercase",
    lineHeight: 14,
    paddingBottom: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    lineHeight: 32,
    paddingBottom: 2,
  },
  statDetail: {
    fontSize: 11,
    color: "#64728b",
    marginTop: 4,
    fontWeight: "600",
    lineHeight: 16,
    paddingBottom: 2,
  },
  overdueCard: {
    marginHorizontal: 24,
    borderRadius: 28,
    padding: 24, // Increased padding
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  overdueTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  overdueAlertCard: {
    borderRadius: 16,
    padding: 14, // Increased padding
    marginBottom: 10,
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
    fontWeight: "800",
    color: "#b91c1c",
  },
  overdueText: {
    fontSize: 13,
    color: "#991b1b",
    opacity: 0.7,
    fontWeight: "600",
  },
  pausedCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderWidth: 1,
    backgroundColor: "#f8fafc",
    padding: 32,
    alignItems: "center",
  },
  pausedTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  pausedDesc: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});
