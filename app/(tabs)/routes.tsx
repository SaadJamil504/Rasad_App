import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const routesData = [
  {
    id: "1",
    name: "Route A — Johar Town",
    driver: "ALI",
    stops: 58,
    status: "Active",
    subRoutes: [
      { id: "s1", time: "5:00 AM", location: "Block C, D, E", customers: 18 },
      { id: "s2", time: "6:00 AM", location: "Block F, G", customers: 12 },
      { id: "s3", time: "7:00 AM", location: "Canal Road", customers: 8 },
    ],
  },
  {
    id: "2",
    name: "Route B — Garden Town",
    driver: "RAZA",
    stops: 36,
    status: "Active",
    subRoutes: [
      { id: "s4", time: "5:30 AM", location: "Main Boulevard", customers: 22 },
      { id: "s5", time: "7:00 AM", location: "Side Streets", customers: 14 },
    ],
  },
];

const initialSequence = [
  { id: "c1", name: "Waleed Hassan", address: "House 45, Block C", order: "01" },
  { id: "c2", name: "Fatima Ape", address: "House 78, Block D", order: "02" },
  { id: "c3", name: "Uncle Tariq", address: "Shop 12, Block E", order: "03" },
];

export default function RoutesScreen() {
  const [sequenceVisible, setSequenceVisible] = useState(false);
  const [selectedSubRoute, setSelectedSubRoute] = useState<any>(null);

  const openSequence = (sub: any) => {
    setSelectedSubRoute(sub);
    setSequenceVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>Routes</ThemedText>
          </View>
          <Pressable style={styles.addRouteButton}>
            <ThemedText style={styles.addRouteText}>+ Route</ThemedText>
          </Pressable>
        </View>

        <ThemedText style={styles.urduTitle}>ڈلیوری کے راستے</ThemedText>

        {routesData.map((route) => (
          <ThemedView key={route.id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View>
                <ThemedText style={styles.routeName}>{route.name}</ThemedText>
                <ThemedText style={styles.routeMeta}>
                  DRIVER: {route.driver} • {route.stops} STOPS
                </ThemedText>
              </View>
              <View style={styles.routeHeaderRight}>
                <ThemedText style={styles.activeTag}>{route.status}</ThemedText>
                <Pressable style={styles.editButton}>
                  <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.subRoutesContainer}>
              {route.subRoutes.map((sub, index) => (
                <Pressable 
                  key={index} 
                  style={styles.subRouteRow}
                  onPress={() => openSequence({ ...sub, routeName: route.name })}
                >
                  <View style={styles.timeTag}>
                    <ThemedText style={styles.timeText}>{sub.time}</ThemedText>
                  </View>
                  <ThemedText style={styles.locationText}>{sub.location}</ThemedText>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ThemedText style={styles.customerCount}>
                      {sub.customers}
                    </ThemedText>
                    <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
                  </View>
                </Pressable>
              ))}
            </View>

            <View style={styles.routeActions}>
              <Pressable style={styles.actionButton}>
                <ThemedText style={styles.actionButtonText}>+ Sub-route</ThemedText>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <ThemedText style={styles.actionButtonText}>View map</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        ))}

        <ThemedView style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={20} color="#b45309" />
            <ThemedText style={styles.warningTitle}>
              Route C has no driver assigned
            </ThemedText>
          </View>
          <ThemedText style={styles.urduWarning}>
            کوئی ڈرائیور نہیں ہے
          </ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Sequence Modal */}
      <Modal
        visible={sequenceVisible}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setSequenceVisible(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </Pressable>
            <ThemedText style={styles.modalTitle}>Customer Sequence</ThemedText>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.sequenceInfo}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <ThemedText style={styles.sequenceRouteName}>
                  {selectedSubRoute?.routeName?.split("—")[0]} → Sub-route 1
                </ThemedText>
                <ThemedText style={styles.sequenceTag}>R2-S1</ThemedText>
              </View>
              <ThemedText style={styles.sequenceLocation}>
                {selectedSubRoute?.location?.toUpperCase()} • {selectedSubRoute?.time} • {selectedSubRoute?.customers} STOPS
              </ThemedText>
            </View>

            <View style={styles.dragInfo}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="swap-vertical" size={20} color="#2563eb" />
                <ThemedText style={styles.dragText}>Drag to reorder delivery sequence</ThemedText>
              </View>
              <ThemedText style={styles.urduDragText}>ترتیب بدلنے کے لیے کھینچیں</ThemedText>
            </View>

            <ThemedText style={styles.sectionTitle}>DELIVERY ORDER</ThemedText>
            {initialSequence.map((item) => (
              <View key={item.id} style={styles.sequenceItem}>
                <ThemedText style={styles.sequenceNumber}>{item.order}</ThemedText>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <ThemedText style={styles.customerName}>{item.name}</ThemedText>
                  <ThemedText style={styles.customerAddress}>{item.address}</ThemedText>
                </View>
                <Ionicons name="grid" size={20} color="#d1d5db" />
              </View>
            ))}

            <View style={styles.addItemRow}>
              <TextInput
                placeholder="Add customer to sub-route"
                placeholderTextColor="#9ca3af"
                style={styles.addInput}
              />
              <Pressable style={styles.addButtonMini}>
                <ThemedText style={styles.addButtonMiniText}>Add</ThemedText>
              </Pressable>
            </View>

            <Pressable style={styles.saveOrderButton} onPress={() => setSequenceVisible(false)}>
              <ThemedText style={styles.saveOrderText}>Save order ✓</ThemedText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// Separate helper for SafeView in dynamic context if needed
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  containerContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  addRouteButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addRouteText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  urduTitle: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 16,
    marginLeft: 40,
  },
  routeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  routeName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  routeMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    fontWeight: "600",
  },
  routeHeaderRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  activeTag: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  subRoutesContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
    paddingVertical: 12,
    marginBottom: 12,
  },
  subRouteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  timeTag: {
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    width: 65,
    alignItems: "center",
  },
  timeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 12,
  },
  customerCount: {
    fontSize: 12,
    color: "#6b7280",
    marginRight: 4,
  },
  routeActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  warningCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#b45309",
  },
  urduWarning: {
    fontSize: 14,
    color: "#b45309",
    marginTop: 4,
    marginLeft: 28,
  },
  // Modal Styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalContent: {
    padding: 16,
  },
  sequenceInfo: {
    marginBottom: 20,
  },
  sequenceRouteName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  sequenceTag: {
    fontSize: 10,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: "#6b7280",
    fontWeight: "700",
  },
  sequenceLocation: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 4,
  },
  dragInfo: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  dragText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  urduDragText: {
    fontSize: 13,
    color: "#2563eb",
    marginTop: 2,
    marginLeft: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9ca3af",
    letterSpacing: 1,
    marginBottom: 12,
  },
  sequenceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sequenceNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: "center",
    lineHeight: 30,
    overflow: "hidden",
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  customerAddress: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  addItemRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButtonMini: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  addButtonMiniText: {
    color: "#fff",
    fontWeight: "700",
  },
  saveOrderButton: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  saveOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
