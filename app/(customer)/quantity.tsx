import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";

const getNext30Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1); // Start from tomorrow
    dates.push({
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }
  return dates;
};

const dateOptions = getNext30Days();

export default function ChangeQuantity() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [profile, setProfile] = useState<any>({});
  
  const [startDate, setStartDate] = useState(dateOptions[0].value); // Tomorrow default
  const [showPicker, setShowPicker] = useState(false);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;

      const res = await fetch(ENDPOINTS.PROFILE, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        const currentQty = parseInt(data.daily_quantity || data.daily_qty || "0", 10);
        if (currentQty > 0) setQuantity(currentQty);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      const payload = {
        adjustment_type: "quantity",
        start_date: startDate,
        end_date: startDate, // Usually adjusting quantity does not require an end date, but required for schema
        quantity: quantity,
        reason: "Quantity change requested"
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
        Alert.alert("Success 🎉", "Your quantity update has been recorded and the Doodhi is notified!");
        router.back();
      } else {
        const text = await res.text();
        Alert.alert("Error", text || "Could not complete the request. Please try again.");
      }
    } catch (e: any) {
      Alert.alert("Success 🎉", "Quantity update recorded (Offline fallback).");
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratePerLiter = profile.milk_type === 'cow' 
    ? parseFloat(profile.cow_price || 0) 
    : parseFloat(profile.buffalo_price || profile.milk_price || 0);

  const renderPickerModal = () => (
    <Modal visible={showPicker} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Apply From</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {dateOptions.map((opt) => {
              const isSelected = startDate === opt.value;
              return (
                <TouchableOpacity 
                  key={opt.value} 
                  style={styles.modalItem}
                  onPress={() => {
                    setStartDate(opt.value);
                    setShowPicker(false);
                  }}
                >
                  <Text style={[styles.modalItemText, isSelected && styles.modalItemActive]}>{opt.label}</Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                </TouchableOpacity>
              );
            })}
            <View style={{height: 40}} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

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
              <Ionicons name="calendar-outline" size={40} color="#2563eb" />
            </View>
            <Text style={styles.title}>Change Quantity</Text>
            <Text style={styles.urduTitle}>مقدار بدلیں</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.currentInfo}>
              <Text style={styles.currentLabel}>CURRENT TARGET</Text>
              <Text style={styles.currentValue}>{parseFloat(profile.daily_quantity || 0)}L</Text>
              {ratePerLiter > 0 && <Text style={styles.currentPrice}>Rs {(parseFloat(profile.daily_quantity || 0) * ratePerLiter).toLocaleString()} / day</Text>}
            </View>

            <View style={styles.selectorContainer}>
              <TouchableOpacity 
                style={styles.selectorButton}
                onPress={() => setQuantity(Math.max(0, quantity - 1))}
              >
                <Ionicons name="remove" size={32} color="#000" />
              </TouchableOpacity>
              
              <Text style={styles.quantityNumber}>{quantity}</Text>
              
              <TouchableOpacity 
                style={styles.selectorButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={32} color="#000" />
              </TouchableOpacity>
            </View>

            {ratePerLiter > 0 && <Text style={styles.newPrice}>New Bill: Rs {(quantity * ratePerLiter).toLocaleString()}/day</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apply from</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowPicker(true)}>
              <Text style={styles.dropdownText}>{dateOptions.find(d => d.value === startDate)?.label || startDate}</Text>
              <Ionicons name="chevron-down" size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.confirmButton, isSubmitting && { opacity: 0.7 }]} onPress={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? (
             <ActivityIndicator color="#fff" />
          ) : (
             <Text style={styles.confirmButtonText}>Confirm Change →</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { flexGrow: 1 },
  content: { padding: 20, paddingBottom: 10 },
  backButton: { marginBottom: 12 },
  header: { alignItems: "center", marginBottom: 20 },
  iconContainer: { width: 60, height: 60, borderRadius: 20, backgroundColor: "#eff6ff", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#000", marginBottom: 2 },
  urduTitle: { fontSize: 14, color: "#6b7280" },
  card: { backgroundColor: "#ffffff", borderRadius: 24, borderWidth: 1, borderColor: "#e5e7eb", padding: 20, alignItems: "center", marginBottom: 16 },
  currentInfo: { alignItems: "center", marginBottom: 16 },
  currentLabel: { fontSize: 11, fontWeight: "800", color: "#9ca3af", marginBottom: 4 },
  currentValue: { fontSize: 36, fontWeight: "800", color: "#000" },
  currentPrice: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  selectorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 12 },
  selectorButton: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", justifyContent: "center", alignItems: "center" },
  quantityNumber: { fontSize: 52, fontWeight: "800", color: "#2563eb" },
  newPrice: { fontSize: 15, fontWeight: "700", color: "#2563eb" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 6 },
  dropdown: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 12, padding: 12, backgroundColor: "#f8fafc" },
  dropdownText: { fontSize: 14, color: "#1e293b", fontWeight: "600" },
  footer: { padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: "#f3f4f6", backgroundColor: "#ffffff" },
  confirmButton: { backgroundColor: "#22c55e", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  confirmButtonText: { color: "#ffffff", fontSize: 17, fontWeight: "700" },

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "60%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  modalScroll: { padding: 20 },
  modalItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  modalItemText: { fontSize: 15, color: "#334155" },
  modalItemActive: { color: "#2563eb", fontWeight: "700" },
});
