import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function PauseDelivery() {
  const router = useRouter();
  const [reason, setReason] = useState("Traveling / سفر");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Icon & Title */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="pause" size={40} color="#2563eb" />
            </View>
            <Text style={styles.title}>Pause Delivery</Text>
            <Text style={styles.urduTitle}>ترسیل عارضی روکیں</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>From</Text>
                <Text style={styles.urduLabel}>کب سے</Text>
              </View>
              <TouchableOpacity style={styles.datePicker}>
                <Text style={styles.dateText}>dd/mm/yyyy</Text>
                <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Resume on</Text>
                <Text style={styles.urduLabel}>کب تک</Text>
              </View>
              <TouchableOpacity style={styles.datePicker}>
                <Text style={styles.dateText}>dd/mm/yyyy</Text>
                <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Reason</Text>
                <Text style={styles.urduLabel}>وجہ</Text>
              </View>
              <TouchableOpacity style={styles.reasonPicker}>
                <Text style={styles.reasonText}>{reason}</Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* WhatsApp Banner */}
            <View style={styles.whatsappBanner}>
              <View style={styles.whatsappHeader}>
                <Ionicons name="logo-whatsapp" size={18} color="#2563eb" />
                <Text style={styles.whatsappTitle}>Doodhi notified on WhatsApp automatically</Text>
              </View>
              <Text style={styles.urduWhatsapp}>ڈودھی کو خود بخود اطلاع مل جائے گی</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={() => router.back()}>
          <Text style={styles.confirmButtonText}>Confirm pause</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  urduTitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  urduLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#ffffff",
  },
  dateText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  reasonPicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#ffffff",
  },
  reasonText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  whatsappBanner: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  whatsappHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  whatsappTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  urduWhatsapp: {
    fontSize: 12,
    color: "#2563eb",
    marginLeft: 26,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  confirmButton: {
    backgroundColor: "#000000",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
