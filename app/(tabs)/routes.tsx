import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";
import { ENDPOINTS } from "../../constants/Api";

export default function RoutesScreen() {
  const router = useRouter();
  const [routesData, setRoutesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals Visibility
  const [addRouteVisible, setAddRouteVisible] = useState(false);
  const [driverPickerVisible, setDriverPickerVisible] = useState(false);

  // New Route Form State
  const [newRouteName, setNewRouteName] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<any[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"select" | "sequence">("select");
  
  // Edit Route State
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);


  useFocusEffect(
    useCallback(() => {
      fetchRoutes();
      fetchDrivers();
      fetchAvailableCustomers();
    }, [])
  );

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(ENDPOINTS.ROUTES as string, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("DEBUG: Routes Response Data:", JSON.stringify(data));
      if (response.ok) {
        setRoutesData(Array.isArray(data) ? data : (data.results || []));
      }

    } catch (e) {
      console.error("Fetch Routes Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(ENDPOINTS.DRIVERS as string, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      const driversList = (Array.isArray(data) ? data : (data.results || []))
        .filter((u: any) => u.role === "driver");
      setAvailableDrivers(driversList);
    } catch (e) { console.error(e); }
  };

  const fetchAvailableCustomers = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(ENDPOINTS.CUSTOMERS_LIST as string, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableCustomers(Array.isArray(data) ? data : (data.results || []));
    } catch (e) { console.error(e); }
  };

  const toggleCustomer = (id: number) => {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleCreateOrUpdateRoute = async () => {
    if (!newRouteName) {
      Alert.alert("Error", "Route name is required.");
      return;
    }
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const payload = {
        name: newRouteName,
        driver: selectedDriver?.id || null,
        customer_ids: selectedCustomerIds
      };

      const url = editingRouteId 
        ? `${ENDPOINTS.ROUTES}${editingRouteId}/`
        : ENDPOINTS.ROUTES as string;
      const method = editingRouteId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert("Success", `Route ${editingRouteId ? "updated" : "created"} successfully!`);
        setAddRouteVisible(false);
        resetForm();
        fetchRoutes();
      } else {
        const errText = await response.text();
        console.log(`DEBUG EDIT ROUTE - Status ${response.status}:`, errText);
        try {
          const err = JSON.parse(errText);
          Alert.alert("Error Response", JSON.stringify(err));
        } catch (e) {
          Alert.alert("Server Error", `Status Code: ${response.status}`);
        }
      }
    } catch (e: any) { 
      Alert.alert("App/Network Error", e.message || "Could not connect to server."); 
    }
  };

  const openAddRoute = () => {
    resetForm();
    setAddRouteVisible(true);
  };

  const openEditRoute = (route: any) => {
    setEditingRouteId(route.id);
    setNewRouteName(route.name || "");
    const driverRaw = availableDrivers.find(d => d.full_name === route.driver_name || d.first_name === route.driver_name);
    setSelectedDriver(driverRaw || (route.driver ? { id: route.driver, full_name: route.driver_name } : null));
    
    // Parse assigned_customer_ids if it's a string, or map if it's an array
    if (typeof route.assigned_customer_ids === 'string') {
        const ids = route.assigned_customer_ids.split(',').map((id:string) => parseInt(id.trim())).filter((id:number) => !isNaN(id));
        setSelectedCustomerIds(ids);
    } else if (Array.isArray(route.assigned_customer_ids)) {
        setSelectedCustomerIds(route.assigned_customer_ids.map((id:any) => parseInt(id)));
    } else {
        setSelectedCustomerIds([]);
    }

    setAddRouteVisible(true);
  };

  const resetForm = () => {
    setEditingRouteId(null);
    setNewRouteName("");
    setSelectedDriver(null);
    setSelectedCustomerIds([]);
    setActiveTab("select");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.containerContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchRoutes} />
        }
      >

        {/* Header Consistent with Customers.tsx */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.title}>Routes</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={openAddRoute}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats consistent with other pages */}
        <ThemedView style={styles.quickStats}>
          <ThemedView style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{routesData.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Routes</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statBox}>
            <ThemedText style={styles.statNumber}>
              {routesData.filter(r => !r.driver_name).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Unassigned</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Routes List */}
        <ThemedView style={styles.listCard}>
          <ThemedText style={styles.sectionHeader}>Active Delivery Plans</ThemedText>
          {isLoading ? (
            <ActivityIndicator size="large" color="#111827" style={{ marginVertical: 40 }} />
          ) : routesData.length > 0 ? (
            routesData.map((route) => (
              <ThemedView key={route.id} style={styles.routeCard}>
                <View style={styles.routeTop}>
                  <View style={[styles.statusDot, route.driver_name ? styles.dotAssigned : styles.dotUnassigned]} />
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold" style={styles.routeNameText}>{route.name}</ThemedText>
                    <ThemedText style={styles.routeMetaText}>
                      Driver: {route.driver_name || "NOT ASSIGNED"}
                    </ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => openEditRoute(route)} style={styles.editBtn}>
                    <Ionicons name="create-outline" size={20} color="#3b82f6" />
                    <ThemedText style={{ color: "#3b82f6", fontWeight: "700", marginLeft: 4 }}>Edit</ThemedText>
                  </TouchableOpacity>
                </View>

                {route.customer_details ? (
                  <View style={{ marginBottom: 12, backgroundColor: "#f8fafc", padding: 10, borderRadius: 10 }}>
                    <ThemedText style={{ fontSize: 13, color: "#475569", fontWeight: "600", lineHeight: 20 }}>
                      <Ionicons name="people" size={12} color="#475569" /> Customers: {Array.isArray(route.customer_details) ? route.customer_details.map((c: any) => typeof c === 'object' ? (c.first_name || c.name || c.username || c.full_name || '') : c).join(", ") : String(route.customer_details || "")}
                    </ThemedText>
                  </View>
                ) : null}

                <View style={styles.routeFooter}>
                   <View style={styles.footerStat}>
                      <Ionicons name="people-outline" size={14} color="#6b7280" />
                      <ThemedText style={styles.footerStatText}>{route.customer_count || 0} Customers</ThemedText>
                   </View>
                   <View style={styles.footerStat}>
                      <Ionicons name="water-outline" size={14} color="#6b7280" />
                      <ThemedText style={styles.footerStatText}>{route.total_quantity || 0}L Milk</ThemedText>
                   </View>
                </View>
              </ThemedView>

            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={48} color="#d1d5db" />
              <ThemedText style={styles.emptyText}>No routes found</ThemedText>
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Add Route Modal - Redesigned for Consistency */}
      <Modal visible={addRouteVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setAddRouteVisible(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </Pressable>
            <ThemedText style={styles.modalTitle}>New Delivery Route</ThemedText>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.inputLabel}>Route Identity</ThemedText>
                <ThemedText style={styles.urduLabel}>راستہ کا نام</ThemedText>
              </View>
              <TextInput
                value={newRouteName}
                onChangeText={setNewRouteName}
                placeholder="e.g. Phase 5, Morning"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.inputLabel}>Assign Driver</ThemedText>
                <ThemedText style={styles.urduLabel}>ڈرائیور منتخب کریں</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.dropdownSelector}
                onPress={() => setDriverPickerVisible(true)}
              >
                <ThemedText style={styles.dropdownValue}>
                  {selectedDriver ? (selectedDriver.first_name || selectedDriver.full_name || selectedDriver.username || "Driver ID " + selectedDriver.id) : "Choose a driver..."}
                </ThemedText>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.customerSection}>
               <View style={styles.labelRow}>
                  <ThemedText style={styles.inputLabel}>Select Customers</ThemedText>
                  <ThemedText style={styles.urduLabel}>گاہک منتخب کریں</ThemedText>
               </View>
               <View style={styles.customerListContainer}>
                  {availableCustomers.map(c => (
                    <Pressable 
                      key={c.id} 
                      style={[styles.customerSelectBtn, selectedCustomerIds.includes(c.id) && styles.customerSelectBtnActive]}
                      onPress={() => toggleCustomer(c.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText style={[styles.custName, selectedCustomerIds.includes(c.id) && styles.custNameActive]}>{c.first_name || c.full_name || c.username}</ThemedText>
                        <ThemedText style={styles.custSub}>
                           {c.house_no ? `${c.house_no}, ` : ''}{c.street ? `${c.street}, ` : ''}{c.area || c.city || c.phone_number} • {c.route_name || 'No current route'}
                        </ThemedText>
                      </View>
                      {selectedCustomerIds.includes(c.id) && (
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      )}
                    </Pressable>
                  ))}
               </View>
            </View>

            <View style={styles.modalFooter}>
               <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleCreateOrUpdateRoute}
               >
                  <ThemedText style={styles.confirmButtonText}>{editingRouteId ? "Save Changes" : "Confirm & Create"}</ThemedText>
               </TouchableOpacity>

               <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setAddRouteVisible(false)}
               >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
               </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>

      </Modal>

      {/* Picker Modal */}
      <Modal visible={driverPickerVisible} transparent animationType="fade">
        <View style={styles.pickerOverlay}>
          <ThemedView style={styles.pickerContent}>
            <ThemedText style={styles.pickerTitle}>Select available driver</ThemedText>
            {availableDrivers.map((d: any) => (
              <Pressable key={d.id} style={styles.pickerItem} onPress={() => { setSelectedDriver(d); setDriverPickerVisible(false); }}>
                <ThemedText style={styles.pickerItemText}>{d.first_name || d.full_name || d.username}</ThemedText>
                <ThemedText style={styles.pickerItemPhone}>{d.phone_number || "Driver"}</ThemedText>
              </Pressable>
            ))}
            <Pressable style={styles.pickerClose} onPress={() => setDriverPickerVisible(false)}>
              <ThemedText style={styles.pickerCloseText}>Cancel</ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  containerContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#111827",
    padding: 8,
    borderRadius: 8,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  statBox: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
  },
  statLabel: {
    color: "#6b7280",
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
  },
  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 2,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  routeCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  routeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotAssigned: {
    backgroundColor: "#10b981",
  },
  dotUnassigned: {
    backgroundColor: "#f59e0b",
  },
  routeNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  routeMetaText: { fontSize: 13, color: "#9ca3af", marginTop: 4, fontWeight: "600" },
  editBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  routeFooter: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  footerStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerStatText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#9ca3af",
    marginTop: 8,
  },
  
  // Modal Consistency
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  urduLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  modalInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  dropdownSelector: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownValue: {
    color: "#111827",
    fontSize: 15,
  },
  customerSection: {
    marginBottom: 24,
  },
  customerListContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginTop: 4,
  },
  customerSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  customerSelectBtnActive: {
    borderColor: "#10b981",
    backgroundColor: "#ecfdf5",
  },
  custName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  custNameActive: {
    color: "#065f46",
  },
  custSub: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  modalFooter: {
    gap: 12,
    marginTop: 10,
    paddingBottom: 40,
  },
  confirmButton: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelButtonText: {
    color: "#4b5563",
    fontWeight: "600",
  },
  
  // Picker
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  pickerContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  pickerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  pickerItemPhone: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  pickerClose: {
    marginTop: 20,
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  pickerCloseText: {
    color: "#ffffff",
    fontWeight: "700",
  }
});
