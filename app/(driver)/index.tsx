import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL, ENDPOINTS } from "../../constants/Api";

interface DriverProfile {
  full_name: string;
  route_name: string;
  username: string;
  first_name?: string;
  route?: string;
}

interface Delivery {
  id: number | string;
  customer_name: string;
  customer_house_no: string;
  customer_street: string;
  customer_area: string;
  quantity: string;
  status: 'pending' | 'delivered' | 'cancelled' | 'paused';
  total_amount: string;
}

interface AdjustmentRequest {
  id: number;
  customer_name: string;
  adjustment_type: 'pause' | 'quantity_change';
  new_quantity: string | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

export default function DriverHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'failed'>('checking');
  const [stats, setStats] = useState({ today_collection: 0, delivered_count: 0, pending_count: 0 });

  // For Editing Quantity
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editQty, setEditQty] = useState("");

  const fetchData = async () => {
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

      // Fetch Profile
      const profileRes = await fetch(ENDPOINTS.PROFILE, { headers });
      if (profileRes.status === 401) {
        router.replace("/login");
        return;
      }
      const profileData = await profileRes.json();
      setProfile(profileData);

      // Fetch Deliveries
      const deliveriesRes = await fetch(ENDPOINTS.DELIVERIES, { headers });
      const deliveriesData = await deliveriesRes.json();
      const finalDeliveries = Array.isArray(deliveriesData) ? deliveriesData : (deliveriesData.results || []);
      setDeliveries(finalDeliveries);

      // Fetch Adjustment Requests
      const adjustmentsRes = await fetch(ENDPOINTS.ADJUSTMENTS_LIST, { headers });
      const adjustmentsData = await adjustmentsRes.json();
      const finalAdjustments = Array.isArray(adjustmentsData) ? adjustmentsData : (adjustmentsData.results || []);
      setAdjustments(finalAdjustments.filter((a: any) => a.status === 'pending'));

      // Fetch Stats
      const statsRes = await fetch(ENDPOINTS.DRIVER_STATS, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          today_collection: parseFloat(statsData.today_collection || statsData.cash_collected || statsData.total_cash || 0),
          delivered_count: statsData.delivered_count || 0,
          pending_count: statsData.pending_count || 0
        });
      }

      setConnectionStatus('success');
    } catch (err) {
      console.error("❌ API Connection Failed:", err);
      setConnectionStatus('failed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleDelivery = async (deliveryId: number | string) => {
    const url = `${BASE_URL}/accounts/deliveries/toggle/${deliveryId}/`;
    try {
      console.log(`🚀 Toggling delivery at: ${url}`);
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedDelivery = await response.json();
        setDeliveries(current =>
          current.map(d => d.id === deliveryId ? updatedDelivery : d)
        );
      } else {
        const errText = await response.text();
        console.error(`❌ Toggle Failed (${response.status}):`, errText);
        Alert.alert("Error", `Could not update status: ${response.status}`);
      }
    } catch (err) {
      console.error(`❌ Network error while toggling @ ${url}:`, err);
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  const handleUpdateQuantity = async (deliveryId: number | string) => {
    if (!editQty || isNaN(parseFloat(editQty))) {
      Alert.alert("Invalid Input", "Please enter a valid number");
      return;
    }

    const url = `${BASE_URL}/accounts/deliveries/update/${deliveryId}/`;
    try {
      console.log(`🚀 Updating quantity at: ${url} with: ${editQty}`);
      const token = await SecureStore.getItemAsync('userToken');

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          quantity: parseFloat(editQty)
        })
      });

      if (response.ok) {
        const updatedDelivery = await response.json();
        console.log("✅ Quantity updated successfully");
        setDeliveries(current =>
          current.map(d => d.id === deliveryId ? updatedDelivery : d)
        );
        setEditingId(null);
      } else {
        const errText = await response.text();
        console.error(`❌ Update Failed (${response.status}):`, errText);
        Alert.alert("Update Failed", `Server returned ${response.status}. ${errText.substring(0, 50)}`);
      }
    } catch (err) {
      console.error(`❌ Network error while updating @ ${url}:`, err);
      Alert.alert("Network Error", "Could not connect to the server. Please check your internet or try again.");
    }
  };

  const handleAdjustmentAction = async (id: number, action: 'accepted' | 'rejected') => {
    const url = `${BASE_URL}/accounts/adjustments/action/${id}/`;
    try {
      const apiAction = action === 'accepted' ? 'accept' : 'reject';
      console.log(`🚀 Handling adjustment ${id} with action: ${apiAction} at: ${url}`);

      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: apiAction,
          status: action
        })
      });

      if (response.ok) {
        setAdjustments(current => current.filter(a => a.id !== id));
        fetchData(); // Refresh deliveries
        Alert.alert("Success", `Request ${action} successfully.`);
      } else {
        const errText = await response.text();
        console.error(`❌ Adjustment Failed (${response.status}):`, errText);
        Alert.alert("Error", `Could not process request: ${errText || response.status}`);
      }
    } catch (err) {
      console.error(`❌ Network error while handling adjustment @ ${url}:`, err);
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  const doneCount = stats.delivered_count || deliveries.filter(d => d.status === 'delivered').length;
  const leftCount = stats.pending_count || deliveries.filter(d => d.status === 'pending').length;
  const cashCollected = stats.today_collection;

  const formatCash = (amount: number) => {
    if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(1)}k`;
    return `Rs ${amount}`;
  };

  // Function to get initials from customer name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor="#fff"
          />
        }
      >
        {/* Premium Dark Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View style={styles.driverInfo}>
              <Text style={styles.greetingUrdu}>السلام علیکم</Text>
              <Text style={styles.driverName} numberOfLines={1} adjustsFontSizeToFit>
                {profile?.full_name || profile?.first_name || profile?.username || "Driver"}
              </Text>
              <Text style={styles.routeDetailsLine} numberOfLines={1}>
                {profile?.route_name || profile?.route || "DRIVER ROUTE"} • {deliveries.length} STOPS
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await SecureStore.deleteItemAsync('userToken');
                router.replace("/login");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.doneValue]}>{stats.delivered_count || 0}</Text>
              <Text style={styles.statLabel}>DONE</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.leftValue]}>{stats.pending_count || 0}</Text>
              <Text style={styles.statLabel}>LEFT</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.cashValue]}>Rs{((stats.today_collection || 0) / 1000).toFixed(1)}K</Text>
              <Text style={styles.statLabel}>CASH</Text>
            </View>
          </View>
        </View>

        {/* Delivery List Section */}
        <View style={styles.listContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY'S LIST</Text>
            <Text style={styles.sectionUrdu}>آج کی فہرست</Text>
          </View>

          {deliveries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No Deliveries Today</Text>
              <Text style={styles.emptySubtitle}>All caught up! Check back later.</Text>
            </View>
          ) : (
            deliveries.map((item, index) => {
              const isDelivered = item.status === 'delivered';
              const isPending = item.status === 'pending';
              const isCurrent = isPending && !deliveries.some((d, i) => i < index && d.status === 'pending');

              return (
                <View
                  key={item.id}
                  style={[
                    styles.deliveryCard,
                    isCurrent && styles.currentCard,
                    isDelivered && styles.deliveredCard
                  ]}
                >
                  <View style={styles.customerAvatar}>
                    <Text style={styles.avatarInitialText}>
                      {item.customer_name ? item.customer_name[0].toUpperCase() : "C"}
                    </Text>
                  </View>

                  <View style={styles.customerInfo}>
                    <Text style={styles.customerNameText}>{item.customer_name}</Text>
                    <Text style={styles.addressTextSmall}>
                      {(item.customer_house_no || item.customer_street) ? `${item.customer_house_no || ""}, ${item.customer_street || ""}` : "NO ADDRESS"}
                    </Text>
                  </View>

                  <View style={styles.cardRight}>
                    {isDelivered ? (
                      <TouchableOpacity
                        style={styles.qtyDeliveredBadge}
                        onPress={() => handleToggleDelivery(item.id)}
                      >
                        <Text style={styles.qtyDeliveredText}>{parseFloat(item.quantity).toString()}L</Text>
                        <Ionicons name="checkmark" size={16} color="#22c55e" />
                      </TouchableOpacity>
                    ) : isCurrent ? (
                      <View style={styles.activeActionsRow}>
                        <TouchableOpacity
                          style={styles.qtyInputBox}
                          onPress={() => {
                            setEditQty(parseFloat(item.quantity).toString());
                            setEditingId(item.id);
                          }}
                        >
                          <Text style={styles.qtyInputText}>{parseFloat(item.quantity).toString()}</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyLabelSmall}>L</Text>

                        <TouchableOpacity
                          style={styles.doneButton}
                          onPress={() => handleToggleDelivery(item.id)}
                        >
                          <Text style={styles.doneButtonText}>Done</Text>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.nextLabel}>Next</Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modern Update Modal */}
      <Modal
        visible={editingId !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.premiumModal}>
            <View style={styles.modalIconBg}>
              <Ionicons name="water" size={32} color="#000" />
            </View>
            <Text style={styles.premiumModalTitle}>Update Quantity</Text>
            <Text style={styles.modalUrduTitle}>مقدار تبدیل کریں</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.premiumInput}
                keyboardType="decimal-pad"
                value={editQty}
                onChangeText={setEditQty}
                autoFocus
                selectTextOnFocus
              />
              <Text style={styles.inputUnitLabel}>Liters</Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.pCancelBtn} onPress={() => setEditingId(null)}>
                <Text style={styles.pCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pSaveBtn} onPress={() => handleUpdateQuantity(editingId!)}>
                <Text style={styles.pSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '600',
  },
  scrollContent: {
    backgroundColor: '#ffffff',
  },
  headerSection: {
    backgroundColor: '#000',
    padding: 24,
    paddingTop: 1,
    paddingBottom: 48,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverInfo: {
    flex: 1,
  },
  greetingUrdu: {
    fontSize: 22,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  driverName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  routeDetailsLine: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statsSection: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  doneValue: { color: '#22c55e' },
  leftValue: { color: '#ffffff' },
  cashValue: { color: '#f59e0b' },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4b5563',
    marginTop: 4,
    letterSpacing: 1,
  },
  listContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    marginTop: -32,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    minHeight: 600,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  sectionUrdu: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '500',
  },
  deliveryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
  },
  currentCard: {
    borderColor: '#3b82f6',
    borderWidth: 1.5,
  },
  deliveredCard: {
    opacity: 0.8,
    backgroundColor: '#f8fafc',
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarInitialText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  customerInfo: {
    flex: 1,
  },
  customerNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  addressTextSmall: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  qtyDeliveredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyDeliveredText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#22c55e',
  },
  activeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyInputBox: {
    width: 44,
    height: 38,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyInputText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#000',
  },
  qtyLabelSmall: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    marginRight: 4,
  },
  doneButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  nextLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  premiumModal: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
  },
  modalIconBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  premiumModalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
  },
  modalUrduTitle: {
    fontSize: 20,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 24,
  },
  premiumInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
  },
  inputUnitLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#94a3b8',
    marginLeft: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  pCancelBtn: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  pCancelBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748b',
  },
  pSaveBtn: {
    flex: 2,
    backgroundColor: '#000',
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  pSaveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
