import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ChangeQuantity() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(7);
  const ratePerLiter = 210;

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
              <Ionicons name="calendar-outline" size={40} color="#2563eb" />
            </View>
            <Text style={styles.title}>Change Quantity</Text>
            <Text style={styles.urduTitle}>مقدار بدلیں</Text>
          </View>

          {/* Display Card */}
          <View style={styles.card}>
            <View style={styles.currentInfo}>
              <Text style={styles.currentLabel}>CURRENT / موجودہ</Text>
              <Text style={styles.currentValue}>5L</Text>
              <Text style={styles.currentPrice}>Rs 1,050 / day</Text>
            </View>

            {/* Selector */}
            <View style={styles.selectorContainer}>
              <TouchableOpacity 
                style={styles.selectorButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
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

            <Text style={styles.newPrice}>Rs {(quantity * ratePerLiter).toLocaleString()}/day</Text>
          </View>

          {/* Apply From Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apply from</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>Tomorrow / کل سے</Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Confirm Button at the bottom of the screen */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={() => router.back()}>
          <Text style={styles.confirmButtonText}>Confirm →</Text>
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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 30,
    alignItems: "center",
    marginBottom: 32,
  },
  currentInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9ca3af",
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#000",
  },
  currentPrice: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  selectorButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityNumber: {
    fontSize: 64,
    fontWeight: "800",
    color: "#2563eb",
  },
  newPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#ffffff",
  },
  dropdownText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  confirmButton: {
    backgroundColor: "#22c55e",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});
