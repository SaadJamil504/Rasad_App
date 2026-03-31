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
      <View style={styles.headerRow}>
        <View>
          <ThemedText style={styles.title}>Routes</ThemedText>
          <ThemedText style={styles.subtitle}>ڈیلیوری کے راستے</ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddRoute}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.containerContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchRoutes} />
        }
      >

        {/* Quick Stats consistent with other pages */}
        <View style={styles.quickStats}>
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
        </View>

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
    padding: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000",
    lineHeight: 42,
    paddingBottom: 6,
  },
  subtitle: {
    fontSize: 20,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 14,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "900",
    color: "#000",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    marginTop: 6,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  listCard: {
    backgroundColor: "#ffffff",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    marginBottom: 16,
  },
  routeCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  routeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotAssigned: {
    backgroundColor: "#10b981",
  },
  dotUnassigned: {
    backgroundColor: "#f59e0b",
  },
  routeNameText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  routeMetaText: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 2,
    fontWeight: "600",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  routeFooter: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 16,
    marginTop: 4,
  },
  footerStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerStatText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#94a3b8",
    marginTop: 8,
    fontWeight: "600",
  },
  
  // Modal Standard Styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },
  modalBody: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  urduLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  modalInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  dropdownSelector: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  dropdownValue: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  customerSection: {
    marginBottom: 32,
  },
  customerListContainer: {
    marginTop: 8,
  },
  customerSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#fff",
  },
  customerSelectBtnActive: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  custName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  custNameActive: {
    color: "#166534",
  },
  custSub: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontWeight: "600",
  },
  modalFooter: {
    gap: 12,
    marginTop: 10,
    paddingBottom: 60,
  },
  confirmButton: {
    backgroundColor: "#000",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cancelButtonText: {
    color: "#64748b",
    fontWeight: "700",
  },
  
  // Picker Overlay
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  pickerContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    color: "#000",
  },
  pickerItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  pickerItemPhone: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontWeight: "600",
  },
  pickerClose: {
    marginTop: 24,
    backgroundColor: "#f1f5f9",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  pickerCloseText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 15,
  }
});
