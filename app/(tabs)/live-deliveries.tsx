import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";
import { useEffect, useState, useCallback, useRef } from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  View, 
  RefreshControl, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFocusEffect } from '@react-navigation/native';

interface Delivery {
  id: string | number;
  customer_name: string;
  customer_phone: string;
  route_name: string;
  quantity: string;
  status: 'pending' | 'delivered' | 'paused';
  is_delivered: boolean;
  delivered_at: string | null;
}

export default function LiveDeliveriesScreen() {
  const { t } = useLanguage();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [routes, setRoutes] = useState<string[]>(["All"]);
  const router = useRouter();
  
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchDeliveries = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(ENDPOINTS.OWNER_DAILY_DELIVERIES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const deliveryList = Array.isArray(data) ? data : (data.results || []);
        setDeliveries(deliveryList);
        
        // Extract unique routes
        const uniqueRoutes = ["All", ...new Set(deliveryList.map((d: any) => d.route_name || "Unassigned"))] as string[];
        setRoutes(uniqueRoutes);
      }
    } catch (error) {
      console.error("Fetch Deliveries Error:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Focus effect to start/stop interval and fetch on focus
  useFocusEffect(
    useCallback(() => {
      fetchDeliveries();
      
      // Auto-refresh every 2 minutes
      refreshInterval.current = setInterval(() => {
        fetchDeliveries(false);
      }, 120000);

      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }, [])
  );

  useEffect(() => {
    filterData();
  }, [deliveries, searchQuery, selectedRoute, statusFilter]);

  const filterData = () => {
    let filtered = [...deliveries];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.customer_name?.toLowerCase().includes(query) || 
        d.customer_phone?.toLowerCase().includes(query)
      );
    }

    // Route filter
    if (selectedRoute !== "All") {
      filtered = filtered.filter(d => (d.route_name || "Unassigned") === selectedRoute);
    }

    // Status filter
    if (statusFilter !== "All") {
      if (statusFilter === "Pending") {
        filtered = filtered.filter(d => !d.is_delivered && d.status !== 'paused');
      } else if (statusFilter === "Done") {
        filtered = filtered.filter(d => d.is_delivered);
      } else if (statusFilter === "Paused") {
        filtered = filtered.filter(d => d.status === 'paused');
      }
    }

    setFilteredDeliveries(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeliveries(false);
  };

  const stats = {
    pending: deliveries.filter(d => !d.is_delivered && d.status !== 'paused').length,
    completed: deliveries.filter(d => d.is_delivered).length,
    paused: deliveries.filter(d => d.status === 'paused').length,
  };

  const getStatusColor = (status: string, isDelivered: boolean) => {
    if (isDelivered) return "#22c55e"; // Green
    if (status === 'paused') return "#94a3b8"; // Gray
    return "#f59e0b"; // Yellow/Amber for Pending
  };

  const formatDeliveryTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return timestamp;
    }
  };

  const renderItem = ({ item }: { item: Delivery }) => (
    <ThemedView style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.customerName}>{item.customer_name}</ThemedText>
          <ThemedText style={styles.routeName}>{item.route_name || t.unassigned}</ThemedText>
        </View>
        <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status, item.is_delivered) + '20' }]}>
          <View style={[styles.badgeDot, { backgroundColor: getStatusColor(item.status, item.is_delivered) }]} />
          <ThemedText style={[styles.badgeText, { color: getStatusColor(item.status, item.is_delivered) }]}>
            {item.is_delivered ? t.done : (item.status === 'paused' ? t.paused : t.pending)}
          </ThemedText>
        </View>
        
        {item.is_delivered && item.delivered_at && (
          <View style={styles.timeTag}>
            <Ionicons name="time-outline" size={14} color="#64728b" />
            <ThemedText style={styles.timeText}>{formatDeliveryTime(item.delivered_at)}</ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>{t.liveDeliveries || "Live Deliveries"}</ThemedText>
          <ThemedText style={styles.dateText}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</ThemedText>
        </View>
        <TouchableOpacity onPress={() => onRefresh()} style={styles.refreshIcon}>
          <Ionicons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { borderColor: '#fef3c7' }]}>
          <ThemedText style={[styles.statVal, { color: '#f59e0b' }]}>{stats.pending}</ThemedText>
          <ThemedText style={styles.statLabel}>{t.pending}</ThemedText>
        </View>
        <View style={[styles.statBox, { borderColor: '#dcfce7' }]}>
          <ThemedText style={[styles.statVal, { color: '#22c55e' }]}>{stats.completed}</ThemedText>
          <ThemedText style={styles.statLabel}>{t.completed}</ThemedText>
        </View>
        <View style={[styles.statBox, { borderColor: '#f1f5f9' }]}>
          <ThemedText style={[styles.statVal, { color: '#64728b' }]}>{stats.paused}</ThemedText>
          <ThemedText style={styles.statLabel}>{t.paused}</ThemedText>
        </View>
      </View>

      {/* Search & Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder || "Search by name..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routeScroll}>
          {routes.map(route => (
            <TouchableOpacity 
              key={route} 
              style={[styles.routeChip, selectedRoute === route && styles.activeRouteChip]}
              onPress={() => setSelectedRoute(route)}
            >
              <ThemedText style={[styles.routeChipText, selectedRoute === route && styles.activeRouteChipText]}>
                {route === "All" ? t.allStatus : route}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.statusTabs}>
          {["All", "Pending", "Done", "Paused"].map(status => (
            <TouchableOpacity 
              key={status}
              style={[styles.statusTab, statusFilter === status && styles.activeStatusTab]}
              onPress={() => setStatusFilter(status)}
            >
              <ThemedText style={[styles.statusTabText, statusFilter === status && styles.activeStatusTabText]}>
                {status === "All" ? t.allStatus : (status === "Pending" ? t.pending : (status === "Done" ? t.done : t.paused))}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={filteredDeliveries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bicycle-outline" size={64} color="#e2e8f0" />
              <ThemedText style={styles.emptyTitle}>
                {deliveries.length === 0 ? t.noDeliveriesToday : "No matches found"}
              </ThemedText>
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600",
  },
  refreshIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 2,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  routeScroll: {
    marginBottom: 12,
  },
  routeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  activeRouteChip: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  routeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64728b',
  },
  activeRouteChipText: {
    color: '#fff',
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 8,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeStatusTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  statusTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  activeStatusTabText: {
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  routeName: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#64728b',
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
});
