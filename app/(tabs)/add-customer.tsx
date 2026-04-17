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
import { useLanguage } from "../../contexts/LanguageContext";

export default function AddCustomerScreen() {
  const { t } = useLanguage();
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
          { 
            text: "Done", 
            onPress: () => {
              // Clear form state
              setName("");
              setWhatsapp("");
              setHouseNo("");
              setStreet("");
              setArea("");
              setCity("Peshawar");
              setMilkType("buffalo");
              setLiters("2.0");
              setRate("210.00");
              setSelectedRoute(null);
              
              // Navigate to customers list
              router.navigate("/(tabs)/customers");
            }
          }
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
            <ThemedText style={styles.title}>{t.addCustomerTitle}</ThemedText>
            {/* Keeping urduHeader removed as we toggle strings directly */}
          </View>
        </View>

        <View style={styles.tabContainer}>
          <Pressable 
            onPress={() => setActiveMode("manual")}
            style={[styles.tab, activeMode === "manual" && styles.activeTab]}
          >
            <ThemedText style={[styles.tabText, activeMode === "manual" && styles.activeTabText]}>{t.manualForm}</ThemedText>
          </Pressable>
          <Pressable 
            onPress={() => setActiveMode("invite")}
            style={[styles.tab, activeMode === "invite" && styles.activeTab]}
          >
            <ThemedText style={[styles.tabText, activeMode === "invite" && styles.activeTabText]}>{t.sendLink}</ThemedText>
          </Pressable>
        </View>

        {activeMode === "manual" ? (
          <View style={styles.formContainer}>
            
            <ThemedText style={styles.sectionTitle}>{t.personalDetails}</ThemedText>
            <ThemedView style={styles.sectionCard}>
              <View style={styles.inputRow}>
                 <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                 <View style={styles.inputContent}>
                    <ThemedText style={styles.inlineLabel}>{t.fullName}</ThemedText>
                    <TextInput placeholder="Enter name" value={name} onChangeText={setName} style={styles.inlineInput} />
                 </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.inputRow}>
                 <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
                 <View style={styles.inputContent}>
                    <ThemedText style={styles.inlineLabel}>{t.phoneNumber}</ThemedText>
                    <TextInput placeholder="03XXXXXXXXX" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" style={styles.inlineInput} maxLength={11} />
                 </View>
              </View>
            </ThemedView>

            <ThemedText style={styles.sectionTitle}>{t.deliveryAddress}</ThemedText>
            <ThemedView style={styles.sectionCard}>
              <View style={styles.rowGrid}>
                <View style={[styles.inputContentGrid, { borderRightWidth: 1, borderRightColor: "#f1f5f9", paddingRight: 16 }]}>
                   <ThemedText style={styles.inlineLabel}>{t.houseNo}</ThemedText>
                   <TextInput placeholder="e.g. 123 A" value={houseNo} onChangeText={setHouseNo} style={styles.inlineInputGrid} />
                </View>
                <View style={[styles.inputContentGrid, { paddingLeft: 16 }]}>
                   <ThemedText style={styles.inlineLabel}>{t.street}</ThemedText>
                   <TextInput placeholder="Street Name" value={street} onChangeText={setStreet} style={styles.inlineInputGrid} />
                </View>
              </View>
              <View style={[styles.divider, { marginLeft: 16 }]} />
              <View style={styles.rowGrid}>
                <View style={[styles.inputContentGrid, { borderRightWidth: 1, borderRightColor: "#f1f5f9", paddingRight: 16 }]}>
                   <ThemedText style={styles.inlineLabel}>{t.area}</ThemedText>
                   <TextInput placeholder="Area Name" value={area} onChangeText={setArea} style={styles.inlineInputGrid} />
                </View>
                <View style={[styles.inputContentGrid, { paddingLeft: 16 }]}>
                   <ThemedText style={styles.inlineLabel}>{t.city}</ThemedText>
                   <TextInput value={city} onChangeText={setCity} style={styles.inlineInputGrid} />
                </View>
              </View>
            </ThemedView>

            <ThemedText style={styles.sectionTitle}>{t.deliveryPreferences}</ThemedText>
            <ThemedView style={styles.sectionCard}>
              <View style={styles.inputRowNoBorder}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
                  <Ionicons name="water-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <ThemedText style={styles.inlineLabelModern}>{t.milkType}</ThemedText>
                </View>
                <View style={styles.typeRowModern}>
                  {["buffalo", "cow"].map(tItem => (
                    <Pressable 
                      key={tItem} 
                      style={[styles.typeBtnModern, milkType === tItem && styles.typeBtnActiveModern]}
                      onPress={() => setMilkType(tItem as any)}
                    >
                      <ThemedText style={[styles.typeBtnTextModern, milkType === tItem && styles.typeBtnTextActiveModern]}>
                        {tItem === "buffalo" ? t.buffalo : t.cow}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
              
              <View style={[styles.divider, { marginLeft: 16 }]} />

              <View style={styles.rowGrid}>
                <View style={[styles.inputContentGrid, { borderRightWidth: 1, borderRightColor: "#f1f5f9", paddingRight: 16 }]}>
                   <ThemedText style={styles.inlineLabel}>{t.dailyQty}</ThemedText>
                   <TextInput value={liters} onChangeText={setLiters} keyboardType="numeric" style={styles.inlineInputGrid} />
                </View>
                <View style={[styles.inputContentGrid, { paddingLeft: 16, justifyContent: 'center' }]}>
                   <ThemedText style={styles.inlineLabel}>{t.rateFixed}</ThemedText>
                   <ThemedText style={{fontSize: 16, color: '#94a3b8', fontWeight: '600', marginTop: 2}}>Rs {rate} / L</ThemedText>
                </View>
              </View>

              <View style={[styles.divider, { marginLeft: 16 }]} />

              <View style={styles.inputRowDropdown}>
                 <Ionicons name="map-outline" size={20} color="#64748b" style={styles.inputIcon} />
                 <View style={styles.inputContent}>
                    <ThemedText style={styles.inlineLabel}>{t.assignRoute}</ThemedText>
                    <Pressable style={styles.dropdownModern} onPress={() => setShowRoutePicker(true)}>
                      <ThemedText style={[styles.dropdownTextModern, !selectedRoute && {color: "#94a3b8"}]}>
                        {selectedRoute ? selectedRoute.name : "Unassigned"}
                      </ThemedText>
                      <Ionicons name="chevron-down" size={20} color="#cbd5e1" />
                    </Pressable>
                 </View>
              </View>

            </ThemedView>

            <TouchableOpacity 
              style={[styles.saveBtnUI, isLoading && { opacity: 0.7 }]} 
              onPress={handleSaveManual} 
              disabled={isLoading}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" style={{marginRight: 8}} />
              <ThemedText style={styles.saveBtnTextUI}>{t.saveCustomer}</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <ThemedView style={styles.card}>
              <ThemedText style={[styles.label, { marginBottom: 12, fontSize: 13, color: "#475569" }]}>
                {t.secureLinkDesc || "Generate a secure link to share with a new customer. They will be prompted to fill out their details and set a password."}
              </ThemedText>
              
              {!generatedToken ? (
                <TouchableOpacity style={styles.saveBtn} onPress={handleGenerateInvite} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.saveBtnText}>{t.generateInvite}</ThemedText>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.linkResultContainer}>
                  <ThemedText style={styles.label}>{t.webLink}</ThemedText>
                  <ThemedText style={{fontSize: 11, color: '#64748b', marginBottom: 4}}></ThemedText>
                 <View style={styles.linkBox}>
                   <ThemedText style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                     https://rasad-production-a567.up.railway.app/customer-signup?token={generatedToken}
                   </ThemedText>
                   <Pressable style={styles.copyIconBtn} onPress={() => handleCopyLink(`https://rasad-production-a567.up.railway.app/customer-signup?token=${generatedToken}`)}>
                     <Ionicons name="copy-outline" size={20} color="#10b981" />
                   </Pressable>
                  </View>

                  <ThemedText style={[styles.label, {marginTop: 6}]}>{t.rawLink}</ThemedText>
                  <View style={styles.linkBox}>
                   <ThemedText style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                     rasadapp://customer-signup?token={generatedToken}
                   </ThemedText>
                   <Pressable style={styles.copyIconBtn} onPress={() => handleCopyLink(`rasadapp://customer-signup?token=${generatedToken}`)}>
                     <Ionicons name="copy-outline" size={20} color="#10b981" />
                   </Pressable>
                 </View>

                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e2e8f0" }]} onPress={() => setGeneratedToken("")}>
                     <ThemedText style={[styles.saveBtnText, { color: "#111827" }]}>{t.generateAnother}</ThemedText>
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
              <ThemedText style={styles.modalTitle}>{t.chooseRoute}</ThemedText>
              <Pressable onPress={() => setShowRoutePicker(false)}><Ionicons name="close" size={24} /></Pressable>
            </View>
            <FlatList
              data={availableRoutes}
              keyExtractor={(item) => item.id.toString()}
              ListHeaderComponent={
                <Pressable style={styles.routeItem} onPress={() => { setSelectedRoute(null); setShowRoutePicker(false); }}>
                  <ThemedText style={{ color: "#ef4444", fontWeight: "700" }}>{t.unassigned}</ThemedText>
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
  formContainer: { paddingBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginLeft: 8, marginTop: 16 },
  sectionCard: { backgroundColor: "#fff", borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden" },
  inputRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  inputRowNoBorder: { paddingVertical: 16, paddingHorizontal: 16 },
  inputRowDropdown: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  inputIcon: { marginRight: 14 },
  inputContent: { flex: 1 },
  inlineLabel: { fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  inlineLabelModern: { fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 },
  inlineInput: { fontSize: 16, fontWeight: "600", color: "#0f172a", padding: 0, minHeight: 24 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginLeft: 48 },
  rowGrid: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 16 },
  inputContentGrid: { flex: 1 },
  inlineInputGrid: { fontSize: 16, fontWeight: "600", color: "#0f172a", padding: 0, marginTop: 2, minHeight: 24 },
  typeRowModern: { flexDirection: "row", gap: 10 },
  typeBtnModern: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 14, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0" },
  typeBtnActiveModern: { backgroundColor: "#eff6ff", borderColor: "#3b82f6", borderWidth: 1.5 },
  typeBtnTextModern: { fontSize: 14, fontWeight: "700", color: "#64748b" },
  typeBtnTextActiveModern: { color: "#2563eb" },
  dropdownModern: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  dropdownTextModern: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  saveBtnUI: { backgroundColor: "#10b981", paddingVertical: 18, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", marginTop: 24, shadowColor: "#10b981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnTextUI: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
