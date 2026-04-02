import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
    SafeAreaView,
    TouchableOpacity
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { ENDPOINTS } from "../../constants/Api";

export default function AddDriverScreen() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<"manual" | "invite">("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");

  // Manual Form States
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const handleSaveManual = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Required", "Please enter the driver's full name.");
      return;
    }

    const phoneRegex = /^03\d{9}$/;
    if (!phoneNumber.trim() || !phoneRegex.test(phoneNumber.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid 11-digit phone number (e.g., 03XXXXXXXXX).");
      return;
    }

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      const payload = {
        first_name: name,
        phone_number: phoneNumber,
        license_number: licenseNumber,
        role: "driver",
        status: "active"
      };

      const response = await fetch(ENDPOINTS.DRIVERS as string, {
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
        Alert.alert("Success", "Driver added successfully!", [
          { text: "Done", onPress: () => router.back() }
        ]);
      } else {
        const errorMessage = responseData.non_field_errors?.[0] || 
                           responseData.phone_number?.[0] ||
                           responseData.message || 
                           responseData.detail ||
                           "Could not add driver.";
        Alert.alert("Error", errorMessage);
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
        body: JSON.stringify({ role: "driver" })
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
            <ThemedText style={styles.title}>Add Driver</ThemedText>
            <ThemedText style={styles.urduHeader}>نیا ڈرائیور شامل کریں</ThemedText>
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
              <TextInput placeholder="Enter driver name" value={name} onChangeText={setName} style={styles.input} />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>PHONE NUMBER</ThemedText>
              <TextInput placeholder="03XXXXXXXXX" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={styles.input} maxLength={11} />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>LICENSE NUMBER (OPTIONAL)</ThemedText>
              <TextInput placeholder="ABC-123" value={licenseNumber} onChangeText={setLicenseNumber} style={styles.input} />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, isLoading && { opacity: 0.7 }]} 
              onPress={handleSaveManual} 
              disabled={isLoading}
            >
              <ThemedText style={styles.saveBtnText}>Save Driver</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.card}>
            <ThemedText style={[styles.label, { marginBottom: 12, fontSize: 13, color: "#475569" }]}>
            Generate a secure link to share with a new delivery driver. They will use this link to set up their app access.
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
                <ThemedText style={{fontSize: 11, color: '#64748b', marginBottom: 4}}>Redirects to app automatically if backed up to Railway.</ThemedText>
                <View style={styles.linkBox}>
                <ThemedText style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                    https://rasad-production.up.railway.app/driver-signup?token={generatedToken}
                </ThemedText>
                <Pressable style={styles.copyIconBtn} onPress={() => handleCopyLink(`https://rasad-production.up.railway.app/driver-signup?token=${generatedToken}`)}>
                    <Ionicons name="copy-outline" size={20} color="#10b981" />
                </Pressable>
                </View>

                <ThemedText style={[styles.label, {marginTop: 6}]}>RAW DEEP LINK (NOT CLICKABLE IN WHATSAPP)</ThemedText>
                <View style={styles.linkBox}>
                <ThemedText style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                    rasadapp://driver-signup?token={generatedToken}
                </ThemedText>
                <Pressable style={styles.copyIconBtn} onPress={() => handleCopyLink(`rasadapp://driver-signup?token=${generatedToken}`)}>
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
  saveBtn: { backgroundColor: "#10b981", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 16 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  linkResultContainer: { marginTop: 8 },
  linkBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingLeft: 14, paddingRight: 6, paddingVertical: 6, marginBottom: 16 },
  linkText: { flex: 1, fontSize: 14, color: '#334155' },
  copyIconBtn: { padding: 10, backgroundColor: '#f0fdf4', borderRadius: 8 },
}); 
