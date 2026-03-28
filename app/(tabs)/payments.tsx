import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentsScreen() {
  const [customerSearch, setCustomerSearch] = useState("");
  const [amount, setAmount] = useState("0");
  const [date, setDate] = useState("25/03/2026");
  const [method, setMethod] = useState("Cash");
  const [searchQuery, setSearchQuery] = useState(""); // Added

  const currentOutstanding = 8400;
  const balanceAfter = currentOutstanding - (parseFloat(amount) || 0);

  const handleConfirm = () => {
    // Logic to confirm payment
    alert("Payment Confirmed!");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.title}>Payments</ThemedText>
          </View>
          <ThemedText style={styles.urduTitle}>ادائیگی درج کریں</ThemedText>
        </View>

        <ThemedView style={styles.formCard}>
          {/* Customer Section */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>Customer</ThemedText>
              <ThemedText style={styles.urduLabel}>گاہک</ThemedText>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                placeholder="Search customer..."
                placeholderTextColor="#9ca3af"
                value={customerSearch}
                onChangeText={setCustomerSearch}
                style={styles.searchInput}
              />
            </View>
          </View>

          {/* Outstanding Card */}
          <View style={styles.outstandingCard}>
            <ThemedText style={styles.outstandingLabel}>Current outstanding</ThemedText>
            <ThemedText style={styles.urduOutstanding}>موجودہ بقایا</ThemedText>
            <ThemedText style={styles.outstandingAmount}>Rs {currentOutstanding.toLocaleString()}</ThemedText>
            <ThemedText style={styles.customerDetail}>WALEED HASSAN — #492</ThemedText>
          </View>

          {/* Amount Section */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>Amount Rs</ThemedText>
              <ThemedText style={styles.urduLabel}>رقم</ThemedText>
            </View>
            <View style={styles.amountInputContainer}>
              <TextInput
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.amountInput}
                textAlign="center"
              />
            </View>
          </View>

          {/* Date & Method Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.label}>Date</ThemedText>
                <ThemedText style={styles.urduLabel}>تارِیخ</ThemedText>
              </View>
              <Pressable style={styles.pickerField}>
                <ThemedText style={styles.pickerText}>{date}</ThemedText>
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
              </Pressable>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.label}>Method</ThemedText>
                <ThemedText style={styles.urduLabel}>طریقہ</ThemedText>
              </View>
              <Pressable style={styles.pickerField}>
                <View style={styles.methodContent}>
                  <Ionicons name="cash-outline" size={18} color="#6b7280" style={{ marginRight: 6 }} />
                  <ThemedText style={styles.pickerText}>{method}</ThemedText>
                </View>
                <Ionicons name="chevron-down" size={18} color="#6b7280" />
              </Pressable>
            </View>
          </View>

          {/* Balance After Info */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <ThemedText style={styles.infoText}>Balance after payment: Rs {balanceAfter.toLocaleString()}</ThemedText>
            </View>
            <ThemedText style={styles.urduInfo}>ادائیگی کے بعد</ThemedText>
          </View>

          {/* Confirm Button */}
          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <View style={styles.confirmContent}>
              <ThemedText style={styles.confirmText}>Confirm Payment</ThemedText>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </View>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  urduTitle: {
    fontSize: 18,
    color: "#6b7280",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  urduLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: "#111827",
  },
  outstandingCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  outstandingLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  urduOutstanding: {
    fontSize: 12,
    color: "#9ca3af",
    marginVertical: 2,
  },
  outstandingAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginVertical: 4,
  },
  customerDetail: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountInputContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "800",
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  pickerText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoBox: {
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065f46",
  },
  urduInfo: {
    fontSize: 12,
    color: "#059669",
    marginTop: 2,
    marginLeft: 22,
  },
  confirmButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
