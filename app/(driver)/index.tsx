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
            tintColor="#000"
          />
        }
      >
        {/* Top Header - White Background */}
        <View style={styles.whiteHeader}>
          <View style={styles.headerTop}>
            <View style={styles.driverInfo}>
              <Text style={styles.greetingUrdu}>السلام علیکم</Text>
              <Text style={styles.driverName}>
                {profile?.full_name || profile?.first_name || profile?.username || "Driver"}
              </Text>
              <Text style={styles.routeDetailsLabel}>
                {profile?.route_name || profile?.route || "Default Route"} • {deliveries.length} STOPS
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await SecureStore.deleteItemAsync('userToken');
                router.replace("/login");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section - Dark Background */}
        <View style={styles.darkStatsContainer}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{stats.delivered_count || 0}</Text>
            <Text style={styles.statLabel}>DONE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#ffffff' }]}>{stats.pending_count || 0}</Text>
            <Text style={styles.statLabel}>LEFT</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>
              {formatCash(stats.today_collection || 0)}
            </Text>
            <Text style={styles.statLabel}>CASH</Text>
          </View>
        </View>

        {/* Main List Section */}
        <View style={styles.listContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>TODAY'S DELIVERY QUEUE</Text>
              <Text style={styles.sectionUrdu}>آج کی ترتیبی فہرست</Text>
            </View>
            <TouchableOpacity 
              style={styles.sequenceBtn}
              onPress={() => router.push("/(driver)/route")}
            >
              <Ionicons name="swap-vertical" size={18} color="#6b7280" />
              <Text style={styles.sequenceBtnText}>Sequence</Text>
            </TouchableOpacity>
          </View>

          {deliveries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="happy-outline" size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>Route is empty!</Text>
              <Text style={styles.emptySubtitle}>No assignments for today.</Text>
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

                  <View style={styles.customerContent}>
                    <Text style={styles.customerNameText}>{item.customer_name}</Text>
                    <Text style={styles.customerAddressText} numberOfLines={1}>
                      {item.customer_house_no ? `${item.customer_house_no}, ` : ''}{item.customer_street}
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    {isDelivered ? (
                      <TouchableOpacity
                        style={styles.doneBadge}
                        onPress={() => handleToggleDelivery(item.id)}
                      >
                        <Text style={styles.doneText}>{parseFloat(item.quantity).toString()}L</Text>
                        <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                      </TouchableOpacity>
                    ) : isCurrent ? (
                      <View style={styles.activeActions}>
                        <TouchableOpacity
                          style={styles.qtyBox}
                          onPress={() => {
                            setEditQty(parseFloat(item.quantity).toString());
                            setEditingId(item.id);
                          }}
                        >
                          <Text style={styles.qtyValText}>{parseFloat(item.quantity).toString()}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.deliverBtn}
                          onPress={() => handleToggleDelivery(item.id)}
                        >
                          <Ionicons name="send" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.waitingBadge}>
                         <Text style={styles.waitingText}>Wait</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 40 }} />
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
  scrollContent: {
    backgroundColor: '#ffffff',
  },
  whiteHeader: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    color: '#000',
    letterSpacing: -0.5,
  },
  routeDetailsLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  darkStatsContainer: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4b5563',
    marginTop: 4,
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#1e293b',
  },
  listContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    minHeight: 600,
    marginTop: 20,
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
  sequenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sequenceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
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
    borderColor: '#000',
    borderWidth: 2,
  },
  deliveredCard: {
    opacity: 0.6,
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
  customerContent: {
    flex: 1,
  },
  customerNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  customerAddressText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  doneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
  },
  activeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBox: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qtyValText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  deliverBtn: {
    backgroundColor: '#000',
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  waitingText: {
    fontSize: 12,
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
