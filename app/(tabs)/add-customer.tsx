import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AddCustomerScreen() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [liters, setLiters] = useState("3");
  const [rate, setRate] = useState("210");
  const [route, setRoute] = useState("Route A — Johar Town");
  const [balance, setBalance] = useState("");

  const handleSave = () => {
    // Logic to save the customer would go here
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#111827" />
          </Pressable>
          <ThemedText style={styles.formTitle}>New Customer</ThemedText>
        </View>
        <ThemedText style={styles.urduText}>نیا گاہک</ThemedText>
      </View>

      <ThemedView style={styles.formCard}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
            <ThemedText style={styles.urduLabel}>پورا نام</ThemedText>
          </View>
          <TextInput
            placeholder="Customer's name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            style={styles.formInput}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.inputLabel}>WhatsApp</ThemedText>
            <ThemedText style={styles.urduLabel}>واٹس ایپ</ThemedText>
          </View>
          <TextInput
            placeholder="03XX-XXXXXXX"
            placeholderTextColor="#999"
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
            style={styles.formInput}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.inputLabel}>Liters/Day</ThemedText>
              <ThemedText style={styles.urduLabel}>لیٹر</ThemedText>
            </View>
            <TextInput
              value={liters}
              onChangeText={setLiters}
              keyboardType="numeric"
              style={styles.formInput}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.inputLabel}>Rate Rs/L</ThemedText>
              <ThemedText style={styles.urduLabel}>ریٹ</ThemedText>
            </View>
            <TextInput
              value={rate}
              onChangeText={setRate}
              keyboardType="numeric"
              style={styles.formInput}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.inputLabel}>Route</ThemedText>
            <ThemedText style={styles.urduLabel}>راستہ</ThemedText>
          </View>
          <Pressable style={styles.dropdown}>
            <ThemedText style={styles.dropdownText}>{route}</ThemedText>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <ThemedText style={styles.inputLabel}>Opening Balance Rs</ThemedText>
            <ThemedText style={styles.urduLabel}>پرانا بقایا</ThemedText>
          </View>
          <TextInput
            placeholder="0 (migration from register)"
            placeholderTextColor="#999"
            value={balance}
            onChangeText={setBalance}
            keyboardType="numeric"
            style={styles.formInput}
          />
        </View>

        <View style={styles.formActions}>
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <View style={styles.saveButtonContent}>
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              <Ionicons name="checkmark-sharp" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </View>
          </Pressable>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  containerContent: {
    padding: 16,
    paddingBottom: 40,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 0,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  urduText: {
    fontSize: 18,
    color: "#6b7280",
    fontFamily: "System",
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
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  urduLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  formInput: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 15,
    color: "#111827",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
