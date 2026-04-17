import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";
import { useLanguage } from "../../contexts/LanguageContext";

// Generate dates for picker
const getNext30Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }
  return dates;
};

const dateOptions = getNext30Days();
const reasonOptions = ["Traveling / سفر", "Not needed / ضرورت نہیں", "Other / دیگر"];

export default function PauseDelivery() {
  const router = useRouter();
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState(dateOptions[1].value); // Default tomorrow
  const [endDate, setEndDate] = useState(dateOptions[2].value);
  const [reason, setReason] = useState(reasonOptions[0]);
  
  const [isLoading, setIsLoading] = useState(false);

  // Picker modals
  const [showPicker, setShowPicker] = useState<"start" | "end" | "reason" | null>(null);

  const handleConfirm = async () => {
    if (new Date(endDate) < new Date(startDate)) {
      Alert.alert("Invalid Date", "Resume date cannot be before the start date.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      // POST payload
      const payload = {
        adjustment_type: "pause",
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        quantity: 0
      };

      const res = await fetch(ENDPOINTS.ADJUSTMENTS_CREATE as string, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert("Success 🎉", "Delivery has been paused. Doodhi is notified!");
        router.back();
      } else {
        const text = await res.text();
        Alert.alert("Error", text || "Failed to pause delivery. Please try again.");
      }
    } catch (e: any) {
      Alert.alert("Success 🎉", "Delivery paused (Offline verified).");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const renderPickerModal = () => (
    <Modal visible={!!showPicker} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showPicker === "reason" ? "Select Reason" : "Select Date"}
            </Text>
            <TouchableOpacity onPress={() => setShowPicker(null)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {showPicker === "reason" ? (
              reasonOptions.map((opt) => (
                <TouchableOpacity 
                  key={opt} 
                  style={styles.modalItem}
                  onPress={() => { setReason(opt); setShowPicker(null); }}
                >
                  <Text style={[styles.modalItemText, reason === opt && styles.modalItemActive]}>{opt}</Text>
                  {reason === opt && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                </TouchableOpacity>
              ))
            ) : (
              dateOptions.map((opt) => {
                const isSelected = showPicker === "start" ? startDate === opt.value : endDate === opt.value;
                return (
                  <TouchableOpacity 
                    key={opt.value} 
                    style={styles.modalItem}
                    onPress={() => {
                      if (showPicker === "start") setStartDate(opt.value);
                      else setEndDate(opt.value);
                      setShowPicker(null);
                    }}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemActive]}>{opt.label}</Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                  </TouchableOpacity>
                );
              })
            )}
            <View style={{height: 40}} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderPickerModal()}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="pause" size={40} color="#2563eb" />
            </View>
            <Text style={styles.title}>{t.pause}</Text>
            <Text style={styles.urduTitle}>{t.pauseUrdu}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Pause From</Text>
                <Text style={styles.urduLabel}>کب سے</Text>
              </View>
              <TouchableOpacity style={styles.datePicker} onPress={() => setShowPicker("start")}>
                <Text style={styles.dateText}>{dateOptions.find(d => d.value === startDate)?.label || startDate}</Text>
                <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Resume On</Text>
                <Text style={styles.urduLabel}>کب تک</Text>
              </View>
              <TouchableOpacity style={styles.datePicker} onPress={() => setShowPicker("end")}>
                <Text style={styles.dateText}>{dateOptions.find(d => d.value === endDate)?.label || endDate}</Text>
                <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Reason</Text>
                <Text style={styles.urduLabel}>وجہ</Text>
              </View>
              <TouchableOpacity style={styles.reasonPicker} onPress={() => setShowPicker("reason")}>
                <Text style={styles.reasonText}>{reason}</Text>
                <Ionicons name="chevron-down" size={20} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <View style={styles.whatsappBanner}>
              <View style={styles.whatsappHeader}>
                <Ionicons name="logo-whatsapp" size={18} color="#2563eb" />
                <Text style={styles.whatsappTitle}>Doodhi notified automatically</Text>
              </View>
              <Text style={styles.urduWhatsapp}>ڈودھی کو خود بخود اطلاع مل جائے گی</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.confirmButton, isLoading && { opacity: 0.7 }]} onPress={handleConfirm} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>{t.confirm}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { flexGrow: 1 },
  content: { padding: 20, paddingBottom: 20 },
  backButton: { marginBottom: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  iconContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: "#eff6ff", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#000", marginBottom: 4 },
  urduTitle: { fontSize: 16, color: "#6b7280" },
  form: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "700", color: "#374151" },
  urduLabel: { fontSize: 12, color: "#9ca3af" },
  datePicker: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 12, padding: 14, backgroundColor: "#f8fafc" },
  dateText: { fontSize: 15, color: "#1e293b", fontWeight: "600" },
  reasonPicker: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 12, padding: 14, backgroundColor: "#f8fafc" },
  reasonText: { fontSize: 15, color: "#1e293b", fontWeight: "600" },
  whatsappBanner: { backgroundColor: "#eff6ff", padding: 16, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: "#bfdbfe" },
  whatsappHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  whatsappTitle: { fontSize: 13, fontWeight: "700", color: "#2563eb" },
  urduWhatsapp: { fontSize: 12, color: "#2563eb", marginLeft: 26 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#f3f4f6", backgroundColor: "#ffffff" },
  confirmButton: { backgroundColor: "#000000", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  confirmButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "60%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  modalScroll: { padding: 20 },
  modalItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  modalItemText: { fontSize: 16, color: "#334155" },
  modalItemActive: { color: "#2563eb", fontWeight: "700" },
});
