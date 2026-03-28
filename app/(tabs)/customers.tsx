import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const customerData = [
  {
    id: "1",
    name: "Waleed Hassan",
    code: "#492",
    route: "Johar Town",
    daily: "3L/d",
    due: "Rs8,400",
    status: "Overdue",
    days: 12,
    amount: "Rs8,400",
  },
  {
    id: "2",
    name: "Sana Bibi",
    code: "#387",
    route: "Garden Town",
    daily: "5L/d",
    due: "Rs0",
    status: "Clear",
    days: 0,
    amount: "Rs0",
  },
  {
    id: "3",
    name: "Uncle Tariq",
    code: "#581",
    route: "Model Town",
    daily: "2L/d",
    due: "Rs1,890",
    status: "Overdue",
    days: 3,
    amount: "Rs1,890",
  },
];

const tabs = ["All", "Overdue", "Active"];

export default function CustomersScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchText, setSearchText] = useState("");

  const filtered = useMemo(() => {
    return customerData.filter((item) => {
      const term = searchText.toLowerCase();
      const matchesText =
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term);
      if (!matchesText) return false;
      if (selectedTab === "Overdue")
        return item.status.toLowerCase() === "overdue";
      if (selectedTab === "Active")
        return item.status.toLowerCase() !== "overdue";
      return true;
    });
  }, [selectedTab, searchText]);

  const renderCustomer = ({ item }: { item: (typeof customerData)[0] }) => (
    <ThemedView style={styles.customerCard}>
      <View style={styles.customerTop}>
        <View
          style={[
            styles.dot,
            item.status === "Overdue" ? styles.dotOverdue : styles.dotActive,
          ]}
        />
        <View>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={styles.customerMeta}>
            {item.code} • {item.route} • {item.daily}
          </ThemedText>
        </View>
      </View>
      <View style={styles.customerFooter}>
        <ThemedText
          style={
            item.status === "Overdue" ? styles.overdueTag : styles.clearTag
          }
        >
          {item.status}
        </ThemedText>
        <ThemedText style={styles.amount}>{item.due}</ThemedText>
      </View>
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.title}>Customers</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push("/(tabs)/add-customer")}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.quickStats}>
          <ThemedView style={styles.statBox}>
            <ThemedText style={styles.statNumber}>3</ThemedText>
            <ThemedText style={styles.statLabel}>Total Customers</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statBox}>
            <ThemedText style={styles.statNumber}>2</ThemedText>
            <ThemedText style={styles.statLabel}>Overdue</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.card}>
          <TextInput
            placeholder="Search name or reg no..."
            placeholderTextColor="#999999"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />

          <View style={styles.tabRow}>
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.tabButton,
                  selectedTab === tab && styles.tabButtonActive,
                ]}
              >
                <ThemedText
                  style={[
                    styles.tabLabel,
                    selectedTab === tab && styles.tabLabelActive,
                  ]}
                >
                  {tab}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderCustomer}
            scrollEnabled={false}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>No customers found</ThemedText>
            }
          />
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
    paddingBottom: 40,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: "#ffffff",
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
  addButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  statBox: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
  },
  statLabel: {
    color: "#000000",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
  },
  searchInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    color: "#000000",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 8,
    marginHorizontal: 2,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
  },
  tabLabel: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#ffffff",
  },
  customerCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },
  customerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotOverdue: {
    backgroundColor: "#f87171",
  },
  dotActive: {
    backgroundColor: "#22c55e",
  },
  customerMeta: {
    color: "#000000",
    fontSize: 12,
  },
  customerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overdueTag: {
    color: "#dc2626",
    fontWeight: "700",
  },
  clearTag: {
    color: "#16a34a",
    fontWeight: "700",
  },
  amount: {
    fontWeight: "700",
    color: "#000000",
  },
  emptyText: {
    color: "#000000",
    textAlign: "center",
    marginTop: 16,
  },
});
