import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
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
  const [isLoading, setIsLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");

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
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#f1f5f9" },
  label: { fontSize: 11, fontWeight: "800", color: "#94a3b8", marginBottom: 6, letterSpacing: 1 },
  saveBtn: { backgroundColor: "#10b981", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 16 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  linkResultContainer: { marginTop: 8 },
  linkBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingLeft: 14, paddingRight: 6, paddingVertical: 6, marginBottom: 16 },
  linkText: { flex: 1, fontSize: 14, color: '#334155' },
  copyIconBtn: { padding: 10, backgroundColor: '#f0fdf4', borderRadius: 8 },
}); 
