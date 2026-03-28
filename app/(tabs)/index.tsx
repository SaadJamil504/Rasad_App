import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any[]>([]);
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [userRole, setUserRole] = useState("owner");
  const cardWidth = "48%";
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      const role = profileData.role || 'owner';
      setUserRole(role);

      if (role === 'customer') {
        const [statusRes, historyRes] = await Promise.all([
          fetch(ENDPOINTS.DELIVERIES_STATUS, { headers }),
          fetch(ENDPOINTS.DELIVERIES_HISTORY, { headers })
        ]);
        
        const statusData = statusRes.ok ? await statusRes.json() : null;
        const historyData = historyRes.ok ? await historyRes.json() : [];
        const historyList = Array.isArray(historyData) ? historyData : (historyData.results || []);

        const pendingBalance = parseFloat(profileData.outstanding_balance || 0);

        const customerStats = [
          {
            key: "balance",
            title: "Pending Balance",
            value: `Rs ${pendingBalance.toLocaleString()}`,
            detail: pendingBalance > 0 ? "Payment due" : "All cleared",
            accent: pendingBalance > 0 ? "#ef4444" : "#10b981",
            border: pendingBalance > 0 ? "#fca5a5" : "#6ee7b7",
          },
          {
            key: "delivery",
            title: "Today's Delivery",
            value: statusData?.status ? statusData.status.charAt(0).toUpperCase() + statusData.status.slice(1) : "Pending",
            detail: statusData?.quantity ? `${parseFloat(statusData.quantity)} Ltr` : (profileData.daily_quantity ? `${parseFloat(profileData.daily_quantity)} Ltr` : "Unknown"),
            accent: statusData?.status === 'delivered' ? "#10b981" : (statusData?.status === 'paused' ? "#f59e0b" : "#6366f1"),
            border: statusData?.status === 'delivered' ? "#6ee7b7" : (statusData?.status === 'paused' ? "#fcd34d" : "#a5b4fc"),
          },
          {
            key: "milk",
            title: "Daily Target",
            value: profileData.daily_quantity ? `${parseFloat(profileData.daily_quantity)} L` : "0 L",
            detail: `${profileData.milk_type === 'buffalo' ? 'Buffalo' : (profileData.milk_type === 'cow' ? 'Cow' : 'Mix')} Milk`,
            accent: "#f97316",
            border: "#fb923c",
          },
          {
            key: "rate",
            title: "Rate applied",
            value: `Rs ${(profileData.milk_type === 'cow' ? profileData.cow_price : profileData.buffalo_price)}/L`,
            detail: "Pricing plan",
            accent: "#8b5cf6",
            border: "#c4b5fd",
          }
        ];

        const recentDeliveries = historyList.slice(0, 5).map((d: any) => ({
          id: d.id.toString(),
          name: `Delivery - ${d.date ? new Date(d.date).toLocaleDateString() : 'Today'}`,
          days: d.status.charAt(0).toUpperCase() + d.status.slice(1),
          amount: `${parseFloat(d.quantity || 0)} Ltr`,
          color: d.status === 'delivered' ? "#10b981" : (d.status === 'paused' ? "#f59e0b" : "#6366f1"),
          route: `Rs ${d.total_amount || 0}`
        }));

        setDashboardStats(customerStats);
        setOverdueItems(recentDeliveries);

      } else {
        // Fetch Admin / Driver Stats
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
      }
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
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <ThemedView style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <ThemedText style={styles.topTitle}>
            Dashboard
          </ThemedText>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
        </Pressable>

      </ThemedView>

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
                }}
              >
                <ThemedText style={styles.overdueTitle}>
                   {userRole === 'customer' ? 'Recent History' : 'Overdue Alerts'}
                </ThemedText>
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
                    <ThemedText style={{ color: item.color || "#e11d48", fontWeight: "700" }}>
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
