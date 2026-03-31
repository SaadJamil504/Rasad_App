import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
    FlatList,
    SafeAreaView,
    TouchableOpacity
} from "react-native";


import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { ENDPOINTS } from "../../constants/Api";

export default function AddCustomerScreen() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<"manual" | "invite">("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoutePicker, setShowRoutePicker] = useState(false);

  // Form states matching Web Solution Screenshot
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Peshawar"); // Default from screenshot
  const [milkType, setMilkType] = useState<"buffalo" | "cow">("buffalo");
  const [liters, setLiters] = useState("2.0"); // Match screenshot default
  const [rate, setRate] = useState("210.00");
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);

  // Invite states
  const [inviteEmail, setInviteEmail] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(ENDPOINTS.ROUTES as string, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      const routesList = Array.isArray(data) ? data : (data.results || []);
      setAvailableRoutes(routesList);
    } catch (e) {
      console.error("DEBUG: AddCustomer Fetch Routes Error:", e);
    }
  };

  const handleSaveManual = async () => {
    if (!name || !whatsapp) {
      Alert.alert("Required", "Name and Phone Number are mandatory.");
      return;
    }
    
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      // Strict matching with Web Fields + Backend User/Staff requirements
      const payload: any = {
        first_name: name,
        phone_number: whatsapp,
        house_no: houseNo,
        street: street,
        area: area,
        city: city,
        milk_type: milkType,
        daily_quantity: parseFloat(liters).toFixed(2), // Schema uses daily_quantity for Users
        rate_per_liter: parseFloat(rate).toFixed(2),
        role: "customer", // Mandatory for accounts/staff/ creation
        status: "active"
      };


      // Omit route if unassigned per Web behavior
      if (selectedRoute) {
        payload.route = selectedRoute.id;
      }

      const response = await fetch(ENDPOINTS.CUSTOMERS as string, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Customer added successfully!", [
          { text: "Done", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Error", JSON.stringify(responseData));
      }
    } catch (error: any) {
      Alert.alert("Error", "Check Connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    setIsLoading(true);
    setGeneratedToken("");
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(ENDPOINTS.INVITATIONS as string, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: "customer" })
      });
      const data = await response.json();
      if (response.ok) {
        setGeneratedToken(data.token);
      } else {
        Alert.alert("Error", data.detail || "Could not generate link.");
      }
    } catch (e) { Alert.alert("Error", "Server unreachable."); } finally { setIsLoading(false); }
  };

  const handleCopyLink = async (link: string) => {
    if (link) {
      await Clipboard.setStringAsync(link);
      Alert.alert("Copied", "Link copied to clipboard!");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <View>
            <ThemedText style={styles.title}>Add New Customer</ThemedText>
            <ThemedText style={styles.urduHeader}>نیا گاہک شامل کریں</ThemedText>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <Pressable 
            onPress={() => setActiveMode("manual")}
            style={[styles.tab, activeMode === "manual" && styles.activeTab]}
          >
            <ThemedText style={[styles.tabText, activeMode === "manual" && styles.activeTabText]}>Manual Form</ThemedText>
          </Pressable>
          <Pressable 
            onPress={() => setActiveMode("invite")}
            style={[styles.tab, activeMode === "invite" && styles.activeTab]}
          >
            <ThemedText style={[styles.tabText, activeMode === "invite" && styles.activeTabText]}>Send Link</ThemedText>
          </Pressable>
        </View>

        {activeMode === "manual" ? (
          <ThemedView style={styles.card}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>FULL NAME</ThemedText>
              <TextInput placeholder="Enter name" value={name} onChangeText={setName} style={styles.input} />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>PHONE NUMBER</ThemedText>
              <TextInput placeholder="03XXXXXXXXX" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" style={styles.input} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <ThemedText style={styles.label}>HOUSE NO #</ThemedText>
                <TextInput placeholder="e.g. 123 A" value={houseNo} onChangeText={setHouseNo} style={styles.input} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>STREET</ThemedText>
                <TextInput placeholder="Street Name" value={street} onChangeText={setStreet} style={styles.input} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <ThemedText style={styles.label}>AREA</ThemedText>
                <TextInput placeholder="Area Name" value={area} onChangeText={setArea} style={styles.input} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>CITY</ThemedText>
                <TextInput value={city} onChangeText={setCity} style={styles.input} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <ThemedText style={styles.label}>MILK TYPE</ThemedText>
                <View style={styles.typeRow}>
                  {["buffalo", "cow"].map(t => (
                    <Pressable 
                      key={t} 
                      style={[styles.typeBtn, milkType === t && styles.typeBtnActive]}
                      onPress={() => setMilkType(t as any)}
                    >
                      <ThemedText style={[styles.typeBtnText, milkType === t && styles.typeBtnTextActive]}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>DAILY QTY (L)</ThemedText>
                <TextInput value={liters} onChangeText={setLiters} keyboardType="numeric" style={styles.input} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>RATE PER LITER</ThemedText>
              <TextInput value={rate} onChangeText={setRate} keyboardType="numeric" style={styles.input} />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>ASSIGN ROUTE</ThemedText>
              <Pressable style={styles.dropdown} onPress={() => setShowRoutePicker(true)}>
                <ThemedText style={styles.dropdownText}>
                  {selectedRoute ? selectedRoute.name : "Unassigned"}
                </ThemedText>
                <Ionicons name="swap-vertical" size={18} color="#6b7280" />
              </Pressable>
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, isLoading && { opacity: 0.7 }]} 
              onPress={handleSaveManual} 
              disabled={isLoading}
            >
              <ThemedText style={styles.saveBtnText}>Save Customer</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.card}>
             <ThemedText style={[styles.label, { marginBottom: 12, fontSize: 13, color: "#475569" }]}>
               Generate a secure link to share with a new customer. They will be prompted to fill out their details and set a password.
             </ThemedText>
             
             {!generatedToken ? (
               <TouchableOpacity style={styles.saveBtn} onPress={handleGenerateInvite} disabled={isLoading}>
                 {isLoading ? (
                   <ActivityIndicator color="#fff" />
                 ) : (
                   <ThemedText style={styles.saveBtnText}>Generate Invite Link</ThemedText>
                 )}
               </TouchableOpacity>
             ) : (
               <View style={styles.linkResultContainer}>
                 <ThemedText style={styles.label}>WEB LINK (CLICKABLE IN WHATSAPP)</ThemedText>
                 <ThemedText style={{fontSize: 11, color: '#64748b', marginBottom: 4}}>Redirects to app automatically if backend is pushed to Railway.</ThemedText>
                 <View style={styles.linkBox}>
                   <ThemedText style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                     https://rasad-production.up.railway.app/customer-signup?token={generatedToken}
                   </ThemedText>
                   <Pressable style={styles.copyIconBtn} onPress={() => handleCopyLink(`https://rasad-production.up.railway.app/customer-signup?token=${generatedToken}`)}>
                     <Ionicons name="copy-outline" size={20} color="#10b981" />
                   </Pressable>
                 </View>

                 <ThemedText style={[styles.label, {marginTop: 6}]}>RAW DEEP LINK (NOT CLICKABLE IN WHATSAPP)</ThemedText>
                 <View style={styles.linkBox}>
                   <ThemedText style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                     rasadapp://customer-signup?token={generatedToken}
                   </ThemedText>
                   <Pressable style={styles.copyIconBtn} onPress={() => handleCopyLink(`rasadapp://customer-signup?token=${generatedToken}`)}>
                     <Ionicons name="copy-outline" size={20} color="#10b981" />
                   </Pressable>
                 </View>

                 <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e2e8f0" }]} onPress={() => setGeneratedToken("")}>
                    <ThemedText style={[styles.saveBtnText, { color: "#111827" }]}>Generate Another</ThemedText>
                 </TouchableOpacity>
               </View>
             )}
          </ThemedView>
        )}
      </ScrollView>

      <Modal visible={showRoutePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Choose Route</ThemedText>
              <Pressable onPress={() => setShowRoutePicker(false)}><Ionicons name="close" size={24} /></Pressable>
            </View>
            <FlatList
              data={availableRoutes}
              keyExtractor={(item) => item.id.toString()}
              ListHeaderComponent={
                <Pressable style={styles.routeItem} onPress={() => { setSelectedRoute(null); setShowRoutePicker(false); }}>
                  <ThemedText style={{ color: "#ef4444", fontWeight: "700" }}>Unassigned</ThemedText>
                </Pressable>
              }
              renderItem={({ item }) => (
                <Pressable style={styles.routeItem} onPress={() => { setSelectedRoute(item); setShowRoutePicker(false); }}>
                  <ThemedText>{item.name}</ThemedText>
                </Pressable>
              )}
            />
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  containerContent: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 16 },
  backBtn: { backgroundColor: "#f3f4f6", padding: 8, borderRadius: 10 },
  title: { fontSize: 22, fontWeight: "900", color: "#111827" },
  urduHeader: { color: "#6b7280", fontSize: 13 },
  tabContainer: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#fff", elevation: 1 },
  tabText: { fontSize: 13, fontWeight: "700", color: "#6b7280" },
  activeTabText: { color: "#111827" },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#f1f5f9" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: "800", color: "#94a3b8", marginBottom: 6, letterSpacing: 1 },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, fontSize: 15, color: "#1e293b" },
  row: { flexDirection: "row", gap: 12 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0" },
  typeBtnActive: { backgroundColor: "#111827", borderColor: "#111827" },
  typeBtnText: { fontSize: 14, fontWeight: "700", color: "#64748b" },
  typeBtnTextActive: { color: "#fff" },
  dropdown: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, flexDirection: "row", justifyContent: "space-between" },
  dropdownText: { fontSize: 15, color: "#1e293b" },
  saveBtn: { backgroundColor: "#10b981", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 16 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "60%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  routeItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  linkResultContainer: { marginTop: 8 },
  linkBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingLeft: 14, paddingRight: 6, paddingVertical: 6, marginBottom: 16 },
  linkText: { flex: 1, fontSize: 14, color: '#334155' },
  copyIconBtn: { padding: 10, backgroundColor: '#f0fdf4', borderRadius: 8 },
});
